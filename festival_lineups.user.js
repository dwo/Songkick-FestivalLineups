// ==UserScript==
// @name           Festival Lineups
// @namespace      http://www.songkick.com
// @description    add lineups easily
// @include        http://*.songkick.*/festival_instances/new*
// @include        http://*.songkick.*/festivals/*/id/*/edit*
// ==/UserScript==

var InputParser = {
  init : function (textArea) {
    this._textArea = textArea;
  },

  toArray : function (options) {
    var i,
        array = this._textArea.val().split("\n");

    if (options === undefined) {
      return array;
    } else {
      //iterate over parsed tracks
      for (i = 0; i < array.length; i = i + 1) {
        //strip numbering
        if (options.stripNumbers) {
          array[i] = array[i].stripNumbers();
        }

        //remove track if blank
        if (array[i].length === 0) {
          array.splice(i, 1);
          i = i - 1;
          continue;
        }

        //title casing
        if (options.titleCase) {
          array[i] = array[i].toTitleCase();
        }
      }
    }
    return array;
  },

  clear : function () {
    this._textArea.val('');
  }
};

var Lineup = {

  init : function () {
    this.injectHTML();
    InputParser.init($('#lineup_paste_area'));
  },

  injectHTML : function () {
    var artistList  = $('ul#artists'),
        html        = $('
                            <label for="lineup_paste_area">\
                              Paste the artists all up in here\
                            </label>\
                            <ul class="artists"><li>\
                              <textarea id="lineup_paste_area"\
                                        style="width: 442px; height: 150px;" />\
                            </li></ul>\
                            <label for="lineup_pase_options">Options</dt>\
                            <ul>\
                              <li><input type="radio" name="inputStyle" value="append" checked />\
                               Append </li>\
                              <li><input type="radio" name="inputStyle" value="overwrite" />\
                               Overwrite </li>\
                            </ul>\
                            <ul>\
                              <li><input id="lineup_submit" class="submit button" type="button"\
                                     value="Add artists" /></li>\
                              <li><input id="done_submit" class="submit button" type="button"\
                                     value="Done" /></li>\
                            </ul>\
                         ');


    artistList.before(html);
    $('#lineup_submit').click(this.submitHandler);
    $('#done_submit').click(this.doneHandler);
  },

  submitHandler : function () {
    var userArtists     = InputParser.toArray({}),
        songkickArtists = $("dd.artist input"),
        inputStyle      = $("input[name='inputStyle']:checked").val(),
        i, takenSpaces = 0, availableSpaces = 0;

    switch (inputStyle) {
    case 'append':
      for (i = 0; i < songkickArtists.length; i = i + 1) {
        if ($(songkickArtists[i]).val() !== '') {
          takenSpaces += 1;
        }
      }

      availableSpaces = songkickArtists.length - takenSpaces;
      while (availableSpaces < userArtists.length) {
        $("#more_headliners").trigger('click');
        songkickArtists = $("dd.artist input");
        availableSpaces += 15;
      }

      for (i = 0; i < userArtists.length; i = i + 1) {
        $(songkickArtists[takenSpaces + i]).val(userArtists[i]);
      }
      break;
    case 'overwrite':
      //keep adding inputs until your artists fit!
      while (songkickArtists.length < userArtists.length) {
        $("#more_headliners").trigger('click');
        songkickArtists = $("dd.artist input");
      }

      for (i = 0; i < songkickArtists.length; i = i + 1) {
        if (i < userArtists.length) {
          $(songkickArtists[i]).val(userArtists[i]);
        } else {
          $(songkickArtists[i]).val('');
        }
      }
      break;
    }
    InputParser.clear();
  },

  doneHandler : function () {
    $("#festival-lineups-injection").html('');
  }
};

/* To Title Case 1.1.1
 * David Gouch <http://individed.com>
 * 23 May 2008
 * License: http://individed.com/code/to-title-case/license.txt
 *
 * In response to John Gruber's call for a Javascript version of his script:
 * http://daringfireball.net/2008/05/title_case
 */
String.prototype.toTitleCase = function () {
  return this.replace(/([\w&`'‘’"“.@:\/\{\(\[<>_]+-? *)/g, function (match, p1, index, title) {
    if (index > 0 && title.charAt(index - 2) !== ":" &&
      match.search(/^(a(nd?|s|t)?|b(ut|y)|en|for|i[fn]|o[fnr]|t(he|o)|vs?\.?|via)[ \-]/i) > -1) {
      return match.toLowerCase();
    }
    if (title.substring(index - 1, index + 1).search(/['"_{(\[]/) > -1) {
      return match.charAt(0) + match.charAt(1).toUpperCase() + match.substr(2);
    }
    if (match.substr(1).search(/[A-Z]+|&|[\w]+[._][\w]+/) > -1 ||
      title.substring(index - 1, index + 1).search(/[\])}]/) > -1) {
      return match;
    }
    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

/**
* Strips several common forms of numbering & whitespace from the
* front of a string using a regular expression
* examples that would be stripped: 1) #2 3. 4: 5
* @param    string  input_string
* @return   string
*/
String.prototype.stripNumbers = function () {
  return this.replace(/^(\s*[#\d\.:\)]*\s*)/i, '');
};

/**
* Recusively checks for jQuery to be loaded.
*/
function GM_wait() {
  if (typeof unsafeWindow.jQuery === 'undefined') {
    window.setTimeout(GM_wait, 100);
  } else {
    $ = unsafeWindow.jQuery;
    Lineup.init();
  }
}
var GM_start = new GM_wait();
