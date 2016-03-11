import React from 'react';
import Rx from 'rx';
import parser from './Parser';
import countries from './countries';

export default React.createClass({
    getInitialState() {
        return {
            searchText: '',
        };
    },
    componentWillMount() {
        this.textChanged = new Rx.Subject();
        this.textChanged
            .debounce(300)
            .subscribe(searchText => {
                this.setState({
                    searchText,
                });
            });
    },
    render() {
        const textChanged = (e) => {
            this.textChanged.onNext(e.target.value);
        };

        const filtered = () => {
            if (!this.state.searchText) return countries;

            const parsed = parser(this.state.searchText);

            if (!parsed.status) return countries;

            switch (parsed.value.type) {
            case 'field':
                return countries.filter(c =>
                    parsed.value.result.some(({ fieldName, input }) =>
                        c[fieldName].toLowerCase().indexOf(
                            input.toLowerCase()) !== -1));
            case 'any':
                return countries.filter(c =>
                    ['name', 'capitalCity']
                    .some(fieldName =>
                        c[fieldName].toLowerCase().indexOf(
                            parsed.value.result.toLowerCase()) !== -1));
            default:
                return countries;
            }
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
                            <tr key={c.name}><td>{c.name}</td><td>{c.capitalCity}</td></tr>)}
                    </tbody>
                </table>
            </div>
        );
    },
});
