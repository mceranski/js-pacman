export default class HotKey {
    constructor( {keys, name, scope, description } ) {
        this.keys = keys;
        this.name = name;
        this.scope = scope || "*";
        this.pressed = false;
        this.description = description;
    }

    printHelp() {
        var description = ( typeof this.description === 'function' ) ? this.description() : this.description;
        return `${this.keys.map( k => `[${(k.replace(/([a-z])([A-Z])/g, '$1 $2'))}]`).join(',')} to ${description}`;
    }
}