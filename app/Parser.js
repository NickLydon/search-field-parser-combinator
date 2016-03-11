import Parsimmon from 'parsimmon';

const reg = Parsimmon.regex;
const str = Parsimmon.string;
const ws = Parsimmon.optWhitespace;
const seq = Parsimmon.seq;
const alt = Parsimmon.alt;
const all = Parsimmon.all;

function field(fieldRegEx, fieldName) {
    return seq(
        ws,
        reg(fieldRegEx),
        ws,
        str(':'),
        ws,
        reg(/[^\s]*/),
        ws
    ).map(res => ({ fieldName, input: res[5] }));
}

function name() {
    return field(/name/i, 'name');
}

function capitalCity() {
    return field(/capital/i, 'capitalCity');
}

function any() {
    return all;
}

const parser =
    alt(
        alt(name(), capitalCity())
            .atLeast(1)
            .map(result => ({ result, type: 'field' })),
        any()
            .map(result => ({ result, type: 'any' }))
    );

export default s => parser.parse(s);
