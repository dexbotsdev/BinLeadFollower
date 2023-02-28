import pnlWatcher from "binance-leaderboard-listener";

class BinLeadScanner {
  constructor(config,emitter) {
    this.listener = pnlWatcher.listen({
            encryptedUid: config.encryptedUid,
            tradeType: config.tradeType,
            delay:config.delay,
    }); 
    this.oldTrades=[]; 
    this.e= emitter;
    this.initialized=false;

  }
    
  initializeTracker =  () => {
    this.listener.once('update', (data) => { 
          data.forEach(element => {
              this.oldTrades.push(data);
          });
          this.initialized=true;
          
    })


  }
 
  existsOldTrades = (element)=>{

    this.oldTrades.forEach(item =>{
      if(item.symbol === element.symbol && item.updateTimeStamp === element.updateTimeStamp)
      return true;
    })
    return false;
  }

  startTracker =  () => {
    
    this.listener.on('update', (data) => {
          let i=0;
          if(this.initialized)
          data.forEach(element => {
             if(!this.existsOldTrades(element)){
              console.log(element);

              this.e.emit('copyLeaderTrade',element);
             }
           });
    })


  }

}

export default BinLeadScanner;