import React from 'react';
import Rx from 'rx';
import parser from './Parser';
import countries from './countries';

const defaultCountry = ({ name, capitalCity }) => ({
    name,
    capitalCity,
    nameFilter: '',
    capitalCityFilter: '',
});

const countriesWithFilterInfo = countries.map(defaultCountry);

export default React.createClass({
    getInitialState() {
        return {
            parsed: null,
        };
    },
    componentWillMount() {
        this.textChanged = new Rx.Subject();
        this.textChanged
            .debounce(500)
            .subscribe(searchText => {
                this.setState({
                    parsed: parser(searchText),
                });
            });
    },
    render() {
        const textChanged = (e) => {
            this.textChanged.onNext(e.target.value);
        };

        const filtered = () => {
            const parsed = this.state.parsed;
            if (!parsed) return countriesWithFilterInfo;

            if (!parsed.status) return countriesWithFilterInfo;

            const filter = (matchFn, getNameFilter, getCapitalFilter) =>
                countries.reduce((acc, c) => {
                    if (!matchFn(c)) return acc;

                    return acc.concat([{
                        name: c.name,
                        capitalCity: c.capitalCity,
                        nameFilter: getNameFilter(),
                        capitalCityFilter: getCapitalFilter(),
                    }]);
                }, []);

            const getFilterText = field => {
                const filters =
                    parsed.value.result.filter(({ fieldName }) =>
                        fieldName === field);
                return filters.length === 0 ? '' : filters[0].input;
            };
            switch (parsed.value.type) {
            case 'field':
                return filter(
                    c => parsed.value.result.every(({ fieldName, input }) =>
                            c[fieldName].indexOf(
                                input) !== -1),
                    () => getFilterText('name'),
                    () => getFilterText('capitalCity')
                );
            case 'any':
                return filter(
                    c => ['name', 'capitalCity']
                            .some(fieldName =>
                                c[fieldName].indexOf(
                                    parsed.value.result) !== -1),
                    () => parsed.value.result,
                    () => parsed.value.result
                );
            default:
                return countriesWithFilterInfo;
            }
        };

        const highlight = (field, filter) => {
            if (!filter) return [<span key={0}>{field}</span>];

            const split = (s, sub) => {
                if (s.length === 0) return [];

                const index = s.indexOf(sub);
                if (index === -1) return [s];

                const len = sub.length;
                if (index === 0) return [sub].concat(split(s.substr(len), sub));

                return [s.substring(0, index), sub].concat(split(s.substr(index + len), sub));
            };

            return split(field, filter).map((s, i) =>
                        <span key={i} className={`${s === filter ? 'highlight' : ''}`}>
                            {s}
                        </span>);
        };

        return (
            <div>
                <input
                    type="text"
                    style={{ width: '200px' }}
                    placeholder="name: Afghanistan capital: Kabul"
                    onChange={textChanged}
                />
                <table>
                    <thead>
                        <tr><th>Country Name</th><th>Capital City</th></tr>
                    </thead>
                    <tbody>
                        {filtered().map(c =>
                            <tr key={c.name}>
                                <td>{highlight(c.name, c.nameFilter)}</td>
                                <td>{highlight(c.capitalCity, c.capitalCityFilter)}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        );
    },
});
