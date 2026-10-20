import {createJourney} from '../../experience/journey';
import {attachJourneyConsole} from '../../experience/consoleReporter';
it('reports actual journey timings without context, payload or query values and detaches cleanly',()=>{
 let time=0;const journal=createJourney({now:()=>time}),write=jest.fn();
 const detach=attachJourneyConsole(journal,write);
 journal.setContext({application:'MANAGER',principal:'private-person',session:'secret'});
 journal.begin('ClientsIndex','click');time=25;journal.present('ClientsIndex');time=100;journal.finish('ClientsIndex');
 journal.record('read.cache-hit',{resource:'people?name=private-query',body:'private-body'});
 const lines=write.mock.calls.map(args=>args.join(' ')).join('\n');
 expect(lines).toContain('"durationMs":100');expect(lines).toContain('view.data-committed');
 for(const secret of ['secret','private-person','private-query','private-body'])expect(lines).not.toContain(secret);
 const count=write.mock.calls.length;detach();journal.begin('OtherPage');expect(write).toHaveBeenCalledTimes(count);
});
