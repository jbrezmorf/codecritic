interface Favicon {
    badge (value:number);
}

interface Toastr {
    success (desc: string, title?: string);
    warning (desc: string, title?: string);
    info (desc: string, title?: string);
    error (desc: string, title?: string);
}

interface Hljs {
    highlightBlock(element: HTMLElement);
    lineNumbersBlock(element: HTMLElement);
}

interface Ace {
    edit(element: any);
}

interface User {
  name: string;
  id: string;
  isAdmin: boolean;
}

interface Window {
    favicon: Favicon;
    toastr: Toastr;
    moment: (time?: any) => any;
    hljs: Hljs;
    ace: Ace;
    user: User;
}

class CCUtils {
  static toArray(arr) {
    return Array.isArray(arr) ? arr : [arr];
  }

  static storagePut(idx, value) {
    var key = CCUtils.toArray(idx).join('/');
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // ignore local storage error
    }
  }

  static storageGet(idx, def) {
    var key = CCUtils.toArray(idx).join('/');
    try {
      if (key in localStorage) {
        return localStorage.getItem(key);
      } else {
        return def === undefined ? null : def;
      }
    } catch (e) {
      // ignore local storage error
      return def === undefined ? null : def;
    }
  }


  static courseStorage(courseID) {
    var course = CCUtils.toArray(courseID);

    return {
      storageGet: function(idx, def=undefined) {
        return CCUtils.storageGet(course.concat(CCUtils.toArray(idx)), def);
      },
      storagePut: function(idx, value) {
        return CCUtils.storagePut(course.concat(CCUtils.toArray(idx)), value);
      }
    }
  }

  static registerDnD(holder, success) {
    if (!(<any>window).FileReader) {
      return false;
    }

    // max size of 2 MB
    var MAX_SIZE = 1024 * 1024 * 2;
    var $holder = $(holder);
    $holder.addClass('draggable');
    holder = $holder.get(0);

    holder.ondragover = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $holder.addClass('hover');
      return false;
    };
    holder.ondragenter = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $holder.addClass('hover');
      return false;
    };

    holder.ondragleave = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $holder.removeClass('hover');
      return false;
    };
    holder.ondragend = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $holder.removeClass('hover');
      return false;
    };

    holder.ondrop = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $holder.removeClass('hover');

      try {
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        if (file.size > MAX_SIZE) {
          alert('The file is too big');
          return false;
        }

        reader.onload = function(event) {
          success(file, event.target.result);
        };

        reader.readAsText(file);
      } catch (e) {
        console.log(e);
      }

      return false;
    };
  }
  
  static logData (data) {
    if (data.data == 'ok, connected') {
      $('#log').empty();
    }
    var copy = $.extend(true, {}, data);
    var msg = '<b>' + copy.event + '</b>: ';
    delete copy.event;
    delete copy.status;
    msg += JSON.stringify(copy) + '\n';
    $('#log').append(msg);
  }

  static apiCall(url: string, data: any, success: any=null, error: any=null) {
    $.ajax({
      type: 'POST',
      dataType: "json",
      url: url,
      contentType: 'application/json;charset=UTF-8',
      data: data ? JSON.stringify(data) : null,
      success: success,
      error: error,
    });
  }

  static loadNotifications (callback?: Function) {
    $.ajax({
      type: 'POST',
      dataType: "json",
      url: '/api/notifications/list',
      contentType: 'application/json;charset=UTF-8',
      data: null,
      success: function(data) {
        if(callback) {
          callback (data);
        } else {
          var length = data.notifications.items.length;
          var oldLength = $('.notification-menu a').length;
          
          if(length == oldLength) {
            return;
          }
            
          $('#notifications').html(
            Templates.render('common/notifications', {notifications: data.notifications.items})
          );
          CCUtils.relativeTime($('#notifications'));
          
          if (length > 0) {
            $('#notifications').removeClass('d-none');
          } else {
            $('#notifications').addClass('d-none');
          }

          $('a[data-api-action]').each((index, elem) => {
              $(elem).click((i) => {
                const action = $(elem).data['api-action'];
                CCUtils.apiCall(
                  '/api/notifications/read',
                  {_id: 'all'},
                  data => {
                    console.log(data);
                  },
                  data => {
                    console.log(data);
                  }
                )
              })
          });
          window.favicon.badge(length);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log('ajax failed', xhr.status, thrownError);
      }
    });
  }
  
  static relativeTime(element: HTMLElement|JQuery) {
    $(element).find('.time-relative').each(function(i, element) {
      var dt = window.moment(Number($(this).data('time')));
      $(this).text(dt.fromNow());
      $(this).parent().attr('title', dt.locale('cs').format('llll'));
    });
    $(element).find('.time-relative-short').each(function(i, element) {
      var dt = window.moment(Number($(this).data('time')));
      $(this).text(dt.fromNow());
      $(this).attr('title', dt.locale('cs').format('llll'));
    });
  }
  
  static enableTooltips(element: HTMLElement|JQuery) {
    $(element).find('[data-toggle="tooltip"]').tooltip();
  }
}

$(document).ready(function() {
  var $user = $('#cc-user');
  window.user = {
    id: $user.data('user-id'),
    name: $user.data('user-name'),
    isAdmin: $user.data('user-admin') == 'True',
  }
  Globals.initEnv();
  CCUtils.relativeTime($('.time'));
  $('[data-toggle="tooltip"]').tooltip();
  window.favicon = new (<any> window).Favico({
		animation : 'up', //'popFade',
	});
  setInterval(CCUtils.loadNotifications, 5000);
  CCUtils.loadNotifications();
});
