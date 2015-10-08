var localesSupported = require('intl-locales-supported');
var i18n = {
  locales: ['en-US']
};

if (window.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!localesSupported(i18n.locales)) {
    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and replace the constructors with need with the polyfill's.
    window.IntlPolyfill = require('intl/dist/Intl').IntlPolyfill;
    window.Intl.NumberFormat = window.IntlPolyfill.NumberFormat;
    window.Intl.DateTimeFormat = window.IntlPolyfill.DateTimeFormat;
  }
} else {
  // No `Intl`, so use and load the polyfill.
  window.Intl = require("intl/dist/Intl").Intl;
  window.IntlPolyfill = require("intl/dist/Intl").IntlPolyfill;
  window.Intl.NumberFormat = window.IntlPolyfill.NumberFormat;
  window.Intl.DateTimeFormat = window.IntlPolyfill.DateTimeFormat;
  require("intl/locale-data/jsonp/en-US");
}

// Load Intl data
var intlData = require('./js/intlData');

var Fluxxor = require("fluxxor");
var React = require("react");
var ReactDOM = require("react-dom");
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var Link = ReactRouter.Link;

var EtherExApp = require("./components/EtherExApp");

var Placeholder = require("./components/Placeholder");

var Trades = require("./components/Trades");
var Markets = require("./components/Markets");
var UserDetails = require("./components/UserDetails");
var Wallet = require("./components/Wallet");
var Tools = require("./components/Tools");
var Help = require("./components/Help");

var Tickets = require("./components/btcswap/Tickets");
var CreateTicket = require("./components/btcswap/CreateTicket");
var ReserveTicket = require("./components/btcswap/ReserveTicket");
var ClaimTicket = require("./components/btcswap/ClaimTicket");
var BtcHelp = require("./components/btcswap/Help");

// Load fonts and icons
require("./css/fonts.css");
require("./css/icons.css");

var ConfigStore = require("./stores/ConfigStore");
var NetworkStore = require("./stores/NetworkStore");
var UserStore = require("./stores/UserStore");
var TradeStore = require("./stores/TradeStore");
var MarketStore = require("./stores/MarketStore");
var TicketStore = require("./stores/btcswap/TicketStore");

var ConfigActions = require("./actions/ConfigActions");
var NetworkActions = require("./actions/NetworkActions");
var UserActions = require("./actions/UserActions");
var TradeActions = require("./actions/TradeActions");
var MarketActions = require("./actions/MarketActions");
var TicketActions = require("./actions/btcswap/TicketActions");

var stores = {
  config: new ConfigStore(),
  network: new NetworkStore(),
  UserStore: new UserStore(),
  MarketStore: new MarketStore(),
  TradeStore: new TradeStore(),
  TicketStore: new TicketStore()
};

var actions = {
  config: new ConfigActions(),
  network: new NetworkActions(),
  user: new UserActions(),
  market: new MarketActions(),
  trade: new TradeActions(),
  ticket: new TicketActions()
};

var flux = new Fluxxor.Flux(stores, actions);

var createFluxComponent = function (Component, props) {
  return <Component {...props} flux={flux} />;
};

flux.setDispatchInterceptor(function(action, dispatch) {
  ReactDOM.unstable_batchedUpdates(function() {
    dispatch(action);
  });
});

class ContextRouter extends Router {
  static get childContextTypes() {
    return {
      locales: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.array
      ]),
      formats : React.PropTypes.object,
      messages: React.PropTypes.object
    }
  }

  getChildContext() {
    var intl = intlData || {};
    var locales = i18n.locales || {};
    var context = {};
    context.locales = i18n.locales;
    context.formats = intlData.formats || {};
    context.messages= intlData.messages || {};

    return context;
  }
}

// Opt-out of fugly _k in query string
import createHistory from 'history/lib/createHashHistory';
var history = createHistory({
  queryKey: false
});

var routes = (
  <ContextRouter history={history} createElement={createFluxComponent}>
    <Route path="/" component={EtherExApp}>
      <IndexRoute component={Trades} />
      <Route path="trades" component={Trades} />
      <Route path="markets" component={Markets} />
      <Route path="markets/subs" component={Markets} />
      <Route path="markets/xchain" component={Markets} />
      <Route path="markets/assets" component={Markets} />
      <Route path="markets/currencies" component={Markets} />
      <Route path="btc/buy" component={Tickets} />
      <Route path="btc/sell" component={CreateTicket} />
      <Route path="btc/reserve" component={ReserveTicket} />
      <Route path="btc/claim" component={ClaimTicket} />
      <Route path="btc/help" component={BtcHelp} />
      <Route path="btc/tickets/:ticketId" component={Tickets} />
      <Route path="wallet" component={Wallet} />
      <Route path="tools" component={Tools} />
      <Route path="help" component={Help} />
      <Route path="user" component={UserDetails} />
      <Route path="*" component={Placeholder} />
    </Route>
  </ContextRouter>
);

ReactDOM.render(routes, document.getElementById('app'));
