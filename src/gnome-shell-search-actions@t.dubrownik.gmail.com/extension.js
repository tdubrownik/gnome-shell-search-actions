const St = imports.gi.St,
  Main = imports.ui.main,
  DBus = imports.dbus,
  Gio = imports.gi.Gio,
  Search = imports.ui.search,
  Gettext = imports.gettext.domain('gnome-shell-search-actions'),
  _ = Gettext.gettext;


var mpIFace = {
      name: 'org.mpris.MediaPlayer2.Player', 
      methods: [
        { name: 'Play',
          inSignature: '',
          outSignature: '' },
        { name: 'Pause',
          inSignature: '',
          outSignature: '' }
      ],
    };
function MP() {
  this._init();
}
MP.prototype = {
  _init: function() {
    DBus.session.proxifyObject(this, 'org.mpris.MediaPlayer2.banshee', '/org/mpris/MediaPlayer2');
  }
}
DBus.proxifyPrototype(MP.prototype, mpIFace);

var searchProvider = null,
  mp = null,
  actions = {
    play: { 
      name: 'Play',
      createIcon: function(size) {
        let xicon = new Gio.ThemedIcon({ name: 'media-playback-start-symbolic'});
        return new St.Icon({ icon_size: size, gicon: xicon });
      },
      action: function() {
        mp.PlayRemote();
      },
    },
    pause: { 
      name: 'Pause',
      createIcon: function(size) {
        let xicon = new Gio.ThemedIcon({ name: 'media-playback-pause-symbolic'});
        return new St.Icon({ icon_size: size, gicon: xicon });
      },
      action: function() {
        mp.PauseRemote();
      },
    },
  }, 
  ids = [];

function ActionSearchProvider() {
  this._init('Actions');
}

ActionSearchProvider.prototype = {
  __proto__: Search.SearchProvider.prototype,

  _init: function(name) {
    Search.SearchProvider.prototype._init.call(this, name);
  },

  activateResult: function(id, params) {
    actions[id].action();
  },

  getInitialResultSet: function(terms) {
    return ids.filter(function(id) {
      return id.indexOf(terms[0]) > -1;
    });
  },

  getSubsearchResultSet: function(previousResults, terms) {
    return this.getInitialResultSet(terms);
  },

  getResultMeta: function(resultId) {
    return actions[resultId];
  },
}

function init() {
  for(var n in actions) {
    ids.push(n);
    actions[n].id = n;
  }
}

function enable() {
  searchProvider = searchProvider || new ActionSearchProvider();
  mp = mp || new MP();
  Main.overview.addSearchProvider(searchProvider);
}

function disable() {
  Main.overview.removeSearchProvider(searchProvider);
  searchProvider = null;
  mp = null;
}
