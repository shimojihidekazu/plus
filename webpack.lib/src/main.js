import "./main.css";
import {keyboard} from "./keyboard.class.js";

export var SelectedStaff = null;
export const criterion_date = '2021-01-01';

var ApplicationTypeHash = null;
var StaffData = null;
var formData = new FormData();

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_customParseFormat);
dayjs.locale('ja');

var selectedApplicationType = null;

const vDate = {
  prev: '',
  now:  '',
  next: ''
};

$(document).ready(function() {

  document.getElementById("block_auth").style.height = window.innerHeight+"px";

  document.querySelector('button.login').addEventListener('click', () => {
    $(document.getElementById('modal_login')).modal('show');
    setTimeout(() => {
      document.querySelector('input.password').focus();
    }, 500);
  });

  document.querySelector('button.btn-PasswordAuth').addEventListener('click', () => {
    let v = document.querySelector('input.password').value;
    if(v.length<=0) {
      let e = document.querySelector('#modal_login div.alert');
      e.innerText = 'パスワードが未入力です';
      e.style.display='block';
      setTimeout(() => {
        document.querySelector('input.password').focus();
      }, 500);
    } else {
      chkPassword(v);
    }
  });

  document.querySelector('button.nonAuth').addEventListener('click', () => {
    document.getElementById('block_auth').style.display='none';
    document.getElementById('block_main').style.display='block';
  });

  document.addEventListener("dblclick", function(e){ e.preventDefault();}, { passive: false });

  document.getElementById('calendar_prev').addEventListener('click', (e) => {
    getCalendar('prev');
  });

  document.getElementById('calendar_next').addEventListener('click', (e) => {
    getCalendar('next');
  });

  const objKeyboard = new keyboard();

  //ステップ入力メニューの初期化
  $('#smartwizard').smartWizard({
    selected: 0,
    theme: 'dots',
    justified: true,
    enableURLhash: false,
    autoAdjustHeight: false,
    toolbarSettings: {
      toolbarPosition: 'none' // none, top, bottom, both
    },
    keyboardSettings: {
        keyNavigation: false
    }
  });

  //職員選択ボタンの生成
  fetch(`/API/V0.1/getStaffs.class.php`).
    then(responce => responce.json()).
    then(staffs => {
      StaffData = staffs;
      for(let i=0;i<staffs.length;++i) {
        document.querySelector('.staffs').appendChild (
          createElementFromHTML (
            `<button class="btn btn-outline-primary btn-lg staff" type="button" data-id="${staffs[i].id}">
              <i class="fas fa-user"></i>&emsp;${staffs[i].name}
            </button>`
          )
        );
      }
    });

  //申請書ボタンの生成
  fetch(`/API/V0.1/ApplicationContentDefinition.class.php`).
    then(responce => responce.json()).
    then(data => {
      ApplicationTypeHash = data;
      for(let k in ApplicationTypeHash) {
        let html = createElementFromHTML (
          `<button class="btn btn-outline-primary btn-lg btn-block ApplicationType" type="button" 
          data-hashkey="${k}" value="${data[k].value}">${data[k].caption}</button>`
        );
        //申請書ボタンクリック処理
        html.addEventListener('click', (e) => {
          ApplicationTypeClick(e.target);
        });
        document.querySelector('.ApplicationTypeButtons').appendChild (html);
      }
    });

  getCalendar();


  document.addEventListener('click', e => {
    let cl = e.target.classList;

    switch(true) {

      //職員ボタンクリック処理
      case cl.contains('staff'):
        StaffClick(e.target);
        break;

      //カレンダー日付クリック処理
      case cl.contains('dayCell'):
        CalendarDayCellClick(e.target);
        break;

      //休暇種別クリック処理
      case cl.contains('AnnualLeave'):
        $('#AnnualLeaveModal').modal("hide");

        formDataSet('AnnualLeave', e.target.innerText);

        let el = document.querySelectorAll('.ApplicationTypeValue');
        for(let i = 0;i < el.length; ++i) {
          el[i].innerText = "｜"+e.target.innerText;
        }

        $('#smartwizard').smartWizard("goToStep", 3);
        break;

      //遅刻・早退モーダルセットボタン押下処理
      case cl.contains('btn-BehindOrEarlyTime'):
        BehindOrEarlyTimeModal_SetButtonClick();
        break;

      //時間外勤務（早出・残業）申請ボタン押下処理
      case cl.contains('btn-Overtime'):
        if(objKeyboard.EarlyTimesConsistencyCompleteCheck()) {

          let a1 = document.getElementById('EarlyFromTime').value;
          let b1 = document.getElementById('EarlyToTime').value;
          let c1 = document.getElementById('EarlyDulationTime').value;

          e = document.querySelectorAll('.EarlyTimesContextBlock');
          for(let i = 0; i<e.length; ++i) {
            e[i].style.display = (a1.length>0 && b1.length>0 && c1.length>0) ? 'table-row' :'none';
          }

          if(a1.length>0 && b1.length>0 && c1.length>0) {
            e = document.querySelectorAll('.EarlyTimesContext');
            for(let i = 0; i<e.length; ++i) {
              e[i].innerHTML = `${a1} 〜 ${b1}&emsp;&emsp;早出時間：${c1}`;
            }
          }

          a1 = document.getElementById('OverFromTime').value;
          b1 = document.getElementById('OverToTime').value;
          c1 = document.getElementById('OverDulationTime').value;

          e = document.querySelectorAll('.OverTimesContextBlock');
          for(let i = 0; i<e.length; ++i) {
            e[i].style.display = (a1.length>0 && b1.length>0 && c1.length>0) ? 'table-row' :'none';
          }

          if(a1.length>0 && b1.length>0 && c1.length>0) {
            e = document.querySelectorAll('.OverTimesContext');
            for(let i = 0; i<e.length; ++i) {
              e[i].innerHTML = `${a1} 〜 ${b1}&emsp;&emsp;残業時間：${c1}`;
            }
          }

          formDataSet('EarlyFromTime', document.getElementById('EarlyFromTime').value);
          formDataSet('EarlyToTime', document.getElementById('EarlyToTime').value);
          formDataSet('EarlyDulationTime', document.getElementById('EarlyDulationTime').value);
          formDataSet('OverFromTime', document.getElementById('OverFromTime').value);
          formDataSet('OverToTime', document.getElementById('OverToTime').value);
          formDataSet('OverDulationTime', document.getElementById('OverDulationTime').value);
          $('#OvertimeModal').modal("hide");
          $('#smartwizard').smartWizard("goToStep", 3);
          document.querySelector('textarea').focus();
        }
        break;

      //確認ボタン押下処理（入力内容の確認画面表示）
      case cl.contains('confirm'):
        ConfirmStepTabShow();
        break;

      //確定処理
      case cl.contains('submit'):
        e.target.querySelector('span').style.display='block';
        e.target.setAttribute('disabled', 'disabled');
        Submit();
        break;
      }
  });

});

function Submit() {
  formDataSet('LoginUserName', document.querySelector('.login_user_name').innerText);

  fetch('/API/V0.1/Application.class.php', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      $('#smartwizard').smartWizard("goToStep", 5);
    });



}

//確認ボタン押下
function ConfirmStepTabShow() {
  let Reason = '';
  let ReasonVal = null;
  let btns = document.querySelector('.ApplicationTypeReasonSet').children;
  for(let i=0; i < btns.length; ++i) {
    if(btns[i].classList.contains('ReasonKind' && 'active')) {
      Reason = btns[i].innerText;
      ReasonVal = btns[i].querySelector('.btn-reason').value;
      break;
    }
  }
  if(ReasonVal == null) {
    alert('理由が未選択です。理由を選択してください');
    return;
  } else if(ReasonVal == '999' && document.querySelector('div.remarks textarea').value == '') {
    alert("理由が未入力です");
    return;
  }

  document.querySelector('.ReasonKindLabel').innerText = Reason;
  if(ReasonVal == '999') {
    document.querySelector('#remarksContentBlock').style.display = "contents";
    document.querySelector('.remarksContent').innerText = document.querySelector('div.remarks textarea').value;
  } else {
    document.querySelector('#remarksContentBlock').style.display = "none";
  }

  formDataSet('ReasonKind', document.querySelector('.ReasonKind.active').innerText);
  formDataSet('ReasonRemarks', document.querySelector('div.remarks textarea').value);

  $('#smartwizard').smartWizard("goToStep", 4);
}

//遅刻・早退モーダル セットボタン押下処理
function BehindOrEarlyTimeModal_SetButtonClick() {
  let o = document.getElementById('BehindOrEarlyTimeModal');
  let elms = o.querySelectorAll('input.keyboard_input');
  let l = 0;
  for(let i=0; i<elms.length; i++) {
    l += elms[i].value.length;
  }
  if(l<=0) {
    let alert = o.querySelector('div.alert');
    alert.innerHTML='時間が設定されていません。時間を入力してください。';
    alert.style.display='block';
    return false;
  }
  $(o).modal("hide");

  let addmsg = [];

  //遅刻時間のチェック
  let BehindTime = document.querySelector('input.BehindTime');
  if(BehindTime.value.length>0) {
    if(BehindTime.classList.contains('is-valid')) {
        addmsg.push(`遅刻時間：${BehindTime.value}`);
    }
  }

  let EarlyTime = document.querySelector('input.EarlyTime');
  if(EarlyTime.value.length>0 && EarlyTime.classList.contains('is-valid')) {
    addmsg.push(` 早退時間：${EarlyTime.value}`);
  }
  let ApplicationTypeValeContent = "（"+addmsg.join('｜')+"）";

  elms = document.querySelectorAll(".ApplicationTypeValue");
  for(let i=0; i<elms.length; i++) {
    elms[i].innerText = ApplicationTypeValeContent;
  }

  if(BehindTime.classList.contains('is-valid')) {
    formDataSet('BehindTime', BehindTime.value);
  }

  if(EarlyTime.classList.contains('is-valid')) {
    formDataSet('EarlyTime', EarlyTime.value);
  }


  $('#smartwizard').smartWizard("goToStep", 3);
  return true;
}

function getCalendar(mode) {
  let _target = '';
  if(mode == 'prev') {
    _target = vDate.prev;
  } else if(mode == 'next') {
    _target = vDate.next;
  }

  let option = {
    method: 'GET',
    mode: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  document.getElementById('loading').style.display='block';
  fetch(`/API/V0.1/getCalendar.class.php?date=${_target}`, option)
    .then(response => response.json())
    .then(data => {

      vDate.prev = data.prev;
      vDate.next = data.next;
      document.querySelector('.nowMonth').innerHTML = data.nowLabel;

      let tbody = document.querySelector('#calendar tbody');
      tbody.innerHTML = '';

      for(let y = 0; y<data.calendar.length; ++y) {
        let tr = document.createElement('tr');
        for(let x = 0;x<data.calendar[y].length;++x) {
          let d = data.calendar[y][x];
          let td = document.createElement('td');
          td.innerHTML = d.day;
          td.classList.add('dayCell');
          td.setAttribute('data-capture', d.capture);
          td.setAttribute('data-ts', d.timestamp);
          if(d.class.length>0) {
            td.classList.add(d.class);
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      document.getElementById('loading').style.display='none';

    });
}


function timechnage(me, newValue, oldValue) {
  let n = null;
  try {
    n = me.parentNode.parentNode.nextSibling.nextSibling.querySelector('input');
  } catch (error) {
    switch(me.getAttribute('id')) {
      case 'EarlyDulationTime':
        let EarlyFromTime = document.getElementById('EarlyFromTime').value;
        let EarlyToTime = document.getElementById('EarlyToTime').value;
        let FromTm   = dayjs(`${criterion_date} ${EarlyFromTime}`, 'YYYY-MM-DD HH:mm', 'ja');
        let ToTm = dayjs(`${criterion_date} ${EarlyToTime}`, 'YYYY-MM-DD HH:mm', 'ja');
        let time1 = ToTm.diff(FromTm);

        ToTm = dayjs(`${criterion_date} ${newValue}`, 'YYYY-MM-DD HH:mm', 'ja');
        FromTm = dayjs(`${criterion_date} 00:00`, 'YYYY-MM-DD HH:mm', 'ja');
        let time2 = ToTm.diff(FromTm);

        if(time1 < time2) alert('早出時間論理エラー');

        break;
      case 'OverDulationTime':

        let OverFromTime = document.getElementById('OverFromTime').value;
        let OverToTime = document.getElementById('OverToTime').value;
          FromTm   = dayjs(`${criterion_date} ${OverFromTime}`, 'YYYY-MM-DD HH:mm', 'ja');
          ToTm = dayjs(`${criterion_date} ${OverToTime}`, 'YYYY-MM-DD HH:mm', 'ja');
          time1 = ToTm.diff(FromTm);

        ToTm = dayjs(`${criterion_date} ${newValue}`, 'YYYY-MM-DD HH:mm', 'ja');
        FromTm = dayjs(`${criterion_date} 00:00`, 'YYYY-MM-DD HH:mm', 'ja');
          time2 = ToTm.diff(FromTm);

        if(time1 < time2) alert('残業時間論理エラー');

        break;
    }

    return;
  }
  setTimeout(
    () => n.focus(),
    100
  );
}

//職員ボタン押下時のイベントハンドラー
function StaffClick(el) {
  for(let i = 0; i < StaffData.length; ++i) {
    if(el.getAttribute('data-id') != StaffData[i].id) continue;
    SelectedStaff = StaffData[i];
    break;
  }
  formDataSet('StaffId', SelectedStaff.id);
  formDataSet('StaffName', SelectedStaff.name);

  let staffs = document.querySelectorAll(".staff");
  for(let i=0;i<staffs.length;i++){
    staffs[i].classList.add('btn-outline-primary');
    staffs[i].classList.remove('btn-primary');
  }

  el.classList.remove('btn-outline-primary');
  el.classList.add('btn-primary');

  let uname = el.innerText;

  let Applicant = document.querySelectorAll(".Applicant");
  for(let i=0;i<Applicant.length;++i) {
    Applicant[i].innerText=uname;
  }
  $('#smartwizard').smartWizard("goToStep", 1);
}

//申請種別選択時
function ApplicationTypeClick(el) {
  selectedApplicationType = el.value;
  formDataSet('ApplicationType', el.value);
  formDataSet('ApplicationTypeName', el.innerText);

  //ボタン選択状態のリセット
  let AplType = document.querySelectorAll(".ApplicationType");
  for(let i=0;i<AplType.length;i++){
    let cl = AplType[i].classList;
    cl.add('btn-outline-primary');
    cl.remove('btn-primary');
  }
  //ボタン選択状態の更新
  el.classList.remove('btn-outline-primary');
  el.classList.add('btn-primary');

  //申請種別名のセット
  let ApplicationTypeName = document.querySelectorAll(".ApplicationTypeName");
  for(let i=0;i<ApplicationTypeName.length;i++){
    ApplicationTypeName[i].innerText = el.innerText;
  }

  //理由リストボタンの生成
  let ApplicationTypeReasonSet = document.querySelector('.ApplicationTypeReasonSet');
  ApplicationTypeReasonSet.innerHTML='';
  let k = el.getAttribute('data-hashKey');

  for(let i=0;i<ApplicationTypeHash[k].Reason.length;i++) {

    let label = createElementFromHTML(`<label class='btn btn-secondary ReasonKind'>`);
    label.innerHTML =
    `<input type="radio" class="btn-reason" autocomplete="off" value="${ApplicationTypeHash[k].Reason[i].value}"> ${ApplicationTypeHash[k].Reason[i].caption}`;

    label.addEventListener('click', e => {
      event.stopPropagation();
      event.preventDefault();

      let el = document.querySelectorAll('.ReasonKind');
      for(let i=0; i < el.length; ++i) {
        el[i].classList.remove('active');
      }

      e.target.classList.add('active');
      let elm = document.querySelector('.remarks');
      elm.style.display = (e.target.children[0].value == 999) ? 'block' : 'none';
      setTimeout(() => {
        elm.querySelector('textarea').focus();
      }, 100);

    });

    ApplicationTypeReasonSet.appendChild(label);
  }

  $('#smartwizard').smartWizard("goToStep", 2);

}

function CalendarDayCellClick(el) {
  formDataSet('date', el.getAttribute('data-capture'));
  //formData.set('date', el.getAttribute('data-ts'));

  let e = document.querySelectorAll('.ApplicationDate');
  for(let i = 0;i < e.length; ++i) {
    e[i].innerHTML = el.getAttribute('data-capture');
  }


  let activecell = document.querySelector("#calendar td.active");
  if(activecell) activecell.classList.remove('active')

  el.classList.add('active');

  let obj = null;
  switch(parseInt(selectedApplicationType)) {
    case 1:
      obj = document.getElementById("BehindOrEarlyTimeModal");
      obj.querySelector('div.alert').style.display='none';
      $(obj).modal('show');
      break;

    case 2:
      obj = document.getElementById("OvertimeModal");
      $(obj).modal('show');
      break;

    case 3:
      let _display = (parseInt(SelectedStaff.partTimeFlag) == 1) ? 'none': 'block';
      let el = document.querySelectorAll('.exceptingPartTime');
      for(let i = 0; i < el.length; ++i) {
        el[i].style.display = _display;
      }

      $('#AnnualLeaveModal').modal('show');
      break;
  }
  return;
}

/**
 * HTML文字列をElementへ変換する。
 */
function createElementFromHTML(html) {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    return tempEl.firstElementChild;
}

function formDataSet(key, value) {
  formData.set(key, value);
  console.log('--------------------------------------------------');
  console.log(...formData.entries());
}

async function chkPassword(passwd) {
  let e = document.querySelector('#modal_login div.alert');
  e.innerText = '';
  e.style.display='none';

  let option = {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({'passwd': passwd})
  }
  let res  = await fetch('/API/V0.1/Auth.class.php', option);
  let data = await res.json();
  if(data.status == 'success') {
    document.querySelector('.login_user_name').innerText = data.profile.name;
    $(document.getElementById('modal_login')).modal('hide');
    document.getElementById('block_auth').style.display='none';
    document.getElementById('block_main').style.display='block';
    document.querySelector(`button.staff[data-id="${data.profile.id}"]`).click();
  } else {
    e.innerText = 'パスワードが確認できません';
    e.style.display='block';
  }
}
