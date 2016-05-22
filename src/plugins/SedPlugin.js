// @flow

import SimpleChanDaemonPlugin from 'plugins/SimpleChanDaemonPlugin';
import Norbert from 'lib/Norbert';

export default class SedPlugin extends SimpleChanDaemonPlugin {
    init(norbert:Norbert) {
        super.init(norbert);
        this.requirePlugin('History');
    }

    getName() {
        return "Sed";
    }

    getHelp() {
        return {
            overview: "Watches for s/search/replace/flags style statements."
        };
    }

    getTriggers():[ (word:string, sender:string, channel:string, idx?:number) => false|
        (channel:string, sender:string, message:string, client:Norbert,triggered:string)=>void] {

        return [
            this.isSed
        ];
    }

    isSed(word:string, sender:string, channel:string, idx:number = 0) {
        return idx == 0 && word.startsWith('s/') ? this.handleReplaceMessage: false;
    }

    handleReplaceMessage(channel:string, sender:string, message:string, norbert:Norbert, triggered:string) {
        const parsed = this.parseSed(message);

        if(parsed === false) {
            return;
        }

        const {search, replace, flags} = parsed;

        let searchExp;

        try {
            // $FlowIgnore
            searchExp = new RegExp(search, flags);
        } catch(e) {
            try {
                searchExp = new RegExp(search);
            } catch(e) {
                return; //fail here because it's not a valid search
            }
        }

        //get recent 5 messages from this channel and try to apply them
        const stmt = norbert.db.prepare("SELECT * FROM history " +
            "WHERE `to`=? AND " +
            "   ID < (SELECT MAX(ID) FROM history) AND" +
            "   message NOT LIKE 's/%'" +
            "ORDER BY ID DESC LIMIT 5");
        stmt.all([channel], (err, rows) => {
            if(err) {
                console.error(err);
                norbert.client.say(channel, "error");
                return;
            }

            for(let i = 0; i < rows.length; i++) {
                const row = rows[i];

                if(row.message.match(searchExp)) {
                    const replaced = `${sender} suggests: <${row.from}> ${row.message.replace(searchExp, replace)}`;
                    norbert.client.say(channel, replaced);
                    break;
                }
            }
        })
    }

    parseSed(str:string) : {search: string, replace: string, flags: string}|false {
        if(!str.startsWith('s/')) {
            return false;
        }

        let search = [];
        let replace = [];
        let flags = [];
        let state = 0;

        //i = 2 because of the s/
        for(let i = 2; i < str.length; i++) {
            const chr = str[i];

            if((chr == '/' && str[i - 1] != "\\") ||
                (chr == '/' && str[i - 1] == "\\" && str[i - 2] == "\\")
            ) {
                state++;
                continue;
            }

            if(state == 0) {
                search.push(chr);
            } else if(state == 1) {
                replace.push(chr);
            } else if(state == 2) {
                flags.push(chr);
            }

        }

        search = search.join('');
        replace = replace.join('');
        flags = flags.join('');

        return {
            search, replace, flags
        }
    }
}