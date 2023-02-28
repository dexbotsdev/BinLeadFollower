
import { EventEmitter } from "emitter";
import fs from 'node:fs'
import BinTrader from "./src/lib/BinTrader.js"; 
import logger from "./src/lib/logger.js"; 
import BinLeadScanner from "./src/lib/BinLeadScanner.js";
import delay from "./src/lib/delay.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const eventEmitter = new EventEmitter();
let config=null; 
async function start() {
    fs.readFile('./config.json', 'utf8', async (error, data) => {
        if(error){
           console.log(error);
           return;
        }
        config= JSON.parse(data);  

        console.log("Delay 5 seconds" )
        delay(5);

        let bin = new BinLeadScanner(config,eventEmitter);

        bin.initializeTracker();
        bin.startTracker();
        eventEmitter.on('newListener', (event, listener) => {
            logger.info(`Added  NewLaunch ${event.toUpperCase()} listener.`);
          });

        eventEmitter.on('copyLeaderTrade', async (tradeSignal) => {
            logger.info('Recieved ');
            let ts = new BinTrader(config);

            logger.info('Open New Market Trade for Signal for SYMBOL - '+ tradeSignal.symbol)
             try{
              
                await ts.tradeEnterSignal(tradeSignal,config);
     
              

             }catch(error){
                console.log(error)
             }
            
        });  
        
        
    }) 
 } 

start();

