import QuotePlugin from '../plugins/QuotePlugin'
import expect from 'expect.js';

describe("Quote plugin", () => {
    it("Tests removal of various timestamp patterns", () => {
       let message = "<foo> is a bar";
       let inputs = [
           "<00:00> ",
           "00:00 - ",
           "[[00:00]] "
       ];

       for(let input of inputs) {
           expect(QuotePlugin.stripTimestamps(input+message)).to.eql(message);
       }
   });
});