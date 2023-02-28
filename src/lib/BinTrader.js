import Binance from "node-binance-api";
import logger from "./logger.js";

class BinTrader {
  constructor(config) {
    this.bin = new Binance().options({
      APIKEY: config.apiKey,
      APISECRET: config.secretKey, 
      test: true,
      hedgeMode: false
    });
    this.investAmount = config.fundsPerTrade;
    this.tpLimits = config.numberOfTakeProfits;
    this.stopLoss = config.stopLoss;
    this.trailingStopLoss = config.trailingStopLoss; 
    this.closePositionAfterXMinutes = config.closePositionAfterXMinutes;
    this.maximumNumberOfOpenPositions = config.maximumNumberOfOpenPositions;
    this.entryType = config.entryType;
    this.cancelTrade = config.cancelTrade;
  }

  futuresTime = async () => {
    return await this.bin.futuresTime();
  }
  f


  futuresAccount = async () => {
    return await this.bin.futuresAccount();
  }

  verifyAccount = async () => {
    const account = await this.futuresAccount();
    logger.docs('Veifying Account ', account.code);
    if (Number(account.code) < 0) return false;
    else return true;
  }

  getBalance = async (currency) => {
    let bal;
    const balance = await this.bin.futuresBalance();
    const keys = Object.keys(balance);
    keys.map((value) => {
      if (balance[value].asset === currency) {
        bal = parseFloat(balance[value].balance);
      }
    });

    return bal;
  };
  

  takeProfitOrder = async (side, symbol, quantity, takeProfitPrice) => {
    return this.bin.futuresOrder(side === 'LONG' ? 'SELL' : 'BUY', symbol, quantity, false, {
      type: "TAKE_PROFIT_MARKET",
      closePosition: true,
      stopPrice: takeProfitPrice,
      quantity: quantity,
      workingType: "CONTRACT_PRICE",
    });
  }


  stopLossOrder = async (side, symbol, quantity, takeProfitPrice) => {
    return this.bin.futuresOrder(side === 'LONG' ? 'SELL' : 'BUY', symbol, quantity, false, {
      type: "STOP_MARKET",
      closePosition: true,
      stopPrice: takeProfitPrice,
      quantity: quantity,
      workingType: "CONTRACT_PRICE",
    });
  }


  tradeEnterSignal = async (tradeSignal, config) => {
    logger.info('Setting Leverage for the Trade '+ config.leverage)

    console.log(tradeSignal)
    let coin = tradeSignal.symbol;
    await this.bin.futuresLeverage(coin, config.leverage);

    await this.bin.futuresMarginType(coin, "ISOLATED");




    let balance = await this.getBalance("USDT");

    if (balance < config.fundsPerTrade) {
      //if (balance < 0) {
      logger.error('Not Enough USDT Balance in account ')
    } else {

      let signalQuote = await this.bin.futuresQuote(tradeSignal.tokenSymbol);
      const symbols = await this.bin.futuresExchangeInfo();
      const symbol = symbols.symbols.filter((item) => item.symbol === coin)[0];


      if (tradeSignal.yellow === false) {
        let entrys = tradeSignal.entryPrice;
        let qttyPerTrade = (config.leverage * config.fundsPerTrade / signalQuote.askPrice) / entrys;
        //console.log(config.leverage* config.fundsPerTrade);
        //console.log(config.leverage* config.fundsPerTrade/ signalQuote.askPrice);
        // console.log((config.leverage * config.fundsPerTrade / signalQuote.askPrice) / entrys.length);
        //console.log('qttyPerTrade.toFixed(symbol.quantityPrecision)='+qttyPerTrade.toFixed(symbol.quantityPrecision));

           logger.info('Placing Limit Order  at ' + qttyPerTrade.toFixed(symbol.quantityPrecision) + ":" + entrys[i]);
          try {
            await this.bin.futuresBuy(coin, qttyPerTrade.toFixed(symbol.quantityPrecision), Number(tradeSignal.entryPrice *1.02).toFixed(symbol.pricePrecision));
          } catch (error) {
            logger.error(error)
          } 

        const allOpenOrders = await this.bin.futuresOpenOrders(coin);
        if (allOpenOrders.length === 0) {
          logger.error('Orders have failed placing');
          return;
        }


          logger.info('Placing Take Profit Orders ' + qttyPerSell.toFixed(symbol.quantityPrecision));
          try {
            const takeProfitPrice = tradeSignal.markPrice*(1+config.takeProfit/100);
            await this.takeProfitOrder(tradeSignal.side, coin, qttyPerSell.toFixed(symbol.quantityPrecision),Number(takeProfitPrice).toFixed(symbol.pricePrecision) );
          } catch (error) {
            logger.error(error)
          } 

        logger.info('Placing StopLoss Order');

        try {

          const stopLoss = tradeSignal.markPrice-(1-config.stopLoss/100);

          await this.stopLossOrder(tradeSignal.side, coin, entrys.length * qttyPerSell.toFixed(symbol.quantityPrecision), stopLoss);

        } catch (error) {
          logger.error(error)
        }
      }
      else if (tradeSignal.yellow === true) {
        let entrys = tradeSignal.entryRange;
        let qttyPerTrade = (config.leverage * config.fundsPerTrade / signalQuote.askPrice) / entrys.length;
        // console.log(config.leverage* config.fundsPerTrade);
        // console.log(config.leverage* config.fundsPerTrade/ signalQuote.bidPrice);
        // console.log((config.leverage * config.fundsPerTrade / signalQuote.askPrice) / entrys.length);
        // console.log('qttyPerTrade.toFixed(symbol.quantityPrecision)='+qttyPerTrade.toFixed(symbol.quantityPrecision));

            logger.info('Placing Limit Order  at ' + qttyPerTrade.toFixed(symbol.quantityPrecision) );

          try {


            await this.bin.futuresSell(coin, qttyPerTrade.toFixed(symbol.quantityPrecision),Number(tradeSignal.entryPrice).toFixed(symbol.pricePrecision));

          } catch (error) {
            logger.error(error)
          }

 
     
          logger.info('Placing Take Profit Orders ' + qttyPerSell.toFixed(symbol.quantityPrecision));
          try {
            const takeProfitPrice = tradeSignal.markPrice*(1-config.takeProfit/100);
            await this.takeProfitOrder(tradeSignal.side, coin, qttyPerSell.toFixed(symbol.quantityPrecision),Number(takeProfitPrice).toFixed(symbol.pricePrecision) );
          } catch (error) {
              logger.error(error)
          } 

        logger.info('Placing StopLoss Order');

        try {

          const stopLoss = tradeSignal.markPrice*(1+config.stopLoss/100);

          await this.stopLossOrder(tradeSignal.side, coin, entrys.length * qttyPerSell.toFixed(symbol.quantityPrecision), stopLoss);

        } catch (error) {
          logger.error(error)
        }
      }

    }



  }

}

export default BinTrader;