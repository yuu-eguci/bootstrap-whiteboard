(function ($) {
  'use strict';

  // data 属性の値が name と一致する要素を返します。 name を CSS セレクタに埋め込まないためのヘルパーです。
  var byData = function (key, name) {
    return $('[data-' + key + ']').filter(function () {
      return $(this).attr('data-' + key) === name;
    });
  };

  $.fn.selModal = function () {

    var SEL_PARENT = $(this);

    SEL_PARENT.each(function () {

      var select_this = $(this);

      var sel_name_attr = String($(this).attr('name'));
      var selected = $(this).prop('selectedIndex');
      var selected_name;
      var sel_default_text = '';

      byData('selmodal', sel_name_attr).remove();
      byData('selmodalbtn', sel_name_attr).remove();

      var aryChild = $(this).children();

      // NOTE: option の文字列や属性を HTML として解釈しないよう、要素は text() と attr() で組み立てます。
      var list = $('<ul>');
      for (var i = 0; i < aryChild.length; i++) {
        var li = $('<li class="selModalClose">').attr('data-value', aryChild.eq(i).val());
        if (aryChild.eq(i).attr('data-image')) {
          li.append($('<img>').attr('src', aryChild.eq(i).attr('data-image')));
        }
        li.append(document.createTextNode(aryChild.eq(i).text()));
        if (selected == i) {
          li.addClass('selected');
          selected_name = aryChild.eq(i).text();
        }
        list.append(li);
      }
      var modal = $('<div class="selModal">').attr('data-selmodal', sel_name_attr).append(
        $('<div class="selModalOverlay selModalClose">'),
        $('<div class="selModalInner">').append(
          $('<div class="selModalHeader">').append($('<div class="selModalCloseIcon selModalClose"><span></span></div>')),
          $('<div class="selModalList">').append(list)
        )
      );

      var button = $('<button type="button" class="selModalButton form-control">')
        .attr('data-selmodalbtn', sel_name_attr)
        .text(selected_name === undefined ? sel_default_text : selected_name);

      // 元のセレクトボックスは非表示
      $(this).hide();
      //ボタン生成
      $(this).after(button);
      //モーダルウインドウ生成
      $('body').append(modal);

      //ボタンクリック
      button.click(function () {

        $(this).openSelModal();
      });

      modal.find('.selModalList').on('touchstart', function () {
        if ($(this).scrollTop() == 0) {
          $(this).scrollTop(1);
        }
        var scrollHeight = $(this)[0].scrollHeight;
        var scrollPosition = $(this).scrollTop() + $(this).height();
        if (scrollHeight == scrollPosition) {
          $(this).scrollTop(($(this).scrollTop() - 1));
        }
      });

      modal.find('.selModalList li').on('touchstart', function () {
        $(this).addClass('totch');
      });

      modal.find('.selModalList li').on('touchend', function () {
        $(this).closest('ul').find('li').removeClass('totch');
      });

      //ボタンクリック
      modal.find('li').click(function () {
        $(this).closest('ul').find('li').removeClass('selected');
        $(this).addClass('selected');
        var this_no = $(this).closest('ul').find('li').index(this);
        var before_no = select_this.prop("selectedIndex");
        select_this.prop("selectedIndex", this_no);
        button.text($(this).text());
        if (this_no != before_no) {
          select_this.trigger('change');
        }
      });

      modal.find('.selModalClose').click(function () {
        $(this).parents(".selModal").hide();
        $('body').removeClass('selModalBody');
      });
    });
  }

  $.fn.selModalSetValue = function (value) {
    var sel_dom = $(this);
    sel_dom.val(value);
    var sel_text = $(sel_dom).find('option:selected').text();
    var name = String(sel_dom.attr('name'));
    var sel_list = byData('selmodal', name);
    var sel_btn = byData('selmodalbtn', name);

    sel_list.find('li').removeClass('selected');
    sel_list.find('li').filter(function () {
      return $(this).attr('data-value') === String(value);
    }).addClass('selected');
    sel_btn.text(sel_text);
  }

  $.fn.openSelModal = function () {
    var href = byData('selmodal', $(this).attr('data-selmodalbtn'));

    $(href).show();
    $('body').addClass('selModalBody');

    var par_height = $(href).find('.selModalInner').outerHeight();
    var c_head = $(href).find('.selModalHeader').outerHeight();
    $(href).find('.selModalList').css('height', (par_height - c_head) + 'px');

    var pos = 0;
    var tr = 0;
    $(href).find('.selModalList ul li').each(function (key, value) {
      if ($(value).hasClass('selected')) {
        tr = $(value).outerHeight(true);
        return false;
      } else {
        pos += $(value).outerHeight(true);
      }
    });

    var sh = $(href).find('.selModalList').height();
    if (sh > 0) pos -= (sh / 2);
    if (tr > 0) pos += (tr / 2);
    $(href).find('.selModalList').scrollTop(pos);
  }

})(jQuery);