import {SelectedStaff, criterion_date} from "./main.js";

export class keyboard {

  current_element = null;

  constructor()
  {
    let keybords = document.querySelectorAll('.keyboard_input');
    for(let i = 0;i < keybords.length; i++) {
      keybords[i].classList.add('animate__animated');
      keybords[i].setAttribute('data_tk_id', i);
      keybords[i].addEventListener('focus', () => this.show());
      //keybords[i].addEventListener('focusout', () => this.lostFocus());
      keybords[i].addEventListener('keydown',() => this.keydown());
    }

    document.addEventListener('click',() => {
      if(event.target.classList.contains('hg-button')) this.keyTap(event.target);
    });

    document.addEventListener('change',() => {
      if(!event.target.classList.contains('KeyboardActive')) return;
    });
  }

  show() {
    this.current_element = window.event.target;

    let k = document.querySelectorAll('.simple-keyboard');
    for(let i = 0;i < k.length; ++i) {
      try {
        let e = k[i].closest('td').querySelector('.keyboard_input');
        if(e.id != this.current_element.id) k[i].innerHTML='';
      } catch(e) {
      }
    }

    let kbd = this.current_element.nextElementSibling;
    if(kbd.classList.contains('simple-keyboard')) {
      kbd.innerHTML=document.getElementById('keyboard').innerHTML;
      this.current_element.classList.add('KeyboardActive');
    }
  }

  keydown() {
    //if(event.key!='Tab') event.preventDefault();
    event.preventDefault();
  }

  keyTap(el) {
    let v = this.current_element.value;
    switch(true) {
      //全てクリアボタン押下
      case el.classList.contains('hg-button-clear'):
        this.current_element.value = '';
        this.current_element.classList.remove('is-valid', 'is-invalid')
        return

      //閉じるボタン押下
      case el.classList.contains('hg-button-close'):
        if(this.current_element.classList.contains('is-invalid')) {
          this.current_element.classList.add('animate__flash');
          this.current_element.addEventListener('animationend', () => {
            this.current_element.classList.remove('animate__flash');
          });
          return;
        }
        this.current_element.classList.remove('KeyboardActive');
        this.closeAllKeyboard();
        return;

      //一文字削除
      case el.classList.contains('hg-button-bksp'):
        this.current_element.value = v.slice(0, -1);
        this.TimeValidate();
        return;

    }
    let txt = el.getAttribute('data-skbtn');
    this.current_element.value = `${v}${el.getAttribute('data-skbtn')}`;
    this.TimeValidate();
  }

  lostFocus() {
    let e = event.target;
    if(e.classList.contains('is-invalid')) return;
    if(e.classList.contains('is-valid') || e.value.length<=0) {
      let ne = e.nextElementSibling;
      if(ne.classList.contains('simple-keyboard')) {
        ne.innerHTML='';
        e.classList.remove('KeyboardActive');
        return;
      }
    }
    e.focus();
  }

  TimeValidate(v) {
    let e = this.current_element;
    e.classList.remove('is-valid', 'is-invalid');
    let f = dayjs(e.value, 'H:mm', true).isValid();
    e.classList.add((f) ? 'is-valid' : 'is-invalid');
    switch(true) {
      //---- 遅刻・早退時間のチェック
      case e.classList.contains('BehindTime'):
        this.BehindTime(e);
        break;
      case e.classList.contains('EarlyTime'):
        this.EarlyTime(e);
        break;

      //---- 早出・残業時間のチェック
      case e.id == 'EarlyFromTime':
        if(!this.EarlyFromTime()) {
          e.focus();
          return false;
        }
        break;
      case e.id == 'EarlyToTime':
        if(!this.EarlyToTime()) e.focus();
        break;
      case e.id == 'EarlyDulationTime':
        if(!this.EarlyDulationTime()) {
          e.focus();
          return false;
        }
        break;

      case e.id == 'OverFromTime':
        if(!this.OverFromTime()) {
          e.focus();
          return false;
        }
        break;
      case e.id == 'OverToTime':
        if(!this.OverToTime()) e.focus();
        break;
      case e.id == 'OverDulationTime':
        if(!this.OverDulationTime()) {
          e.focus();
          return false;
        }
        break;

    }
    if(e.classList.contains('is-valid')) this.closeAllKeyboard();
    return f;
  }

  closeAllKeyboard() {
    let k = document.querySelectorAll('.simple-keyboard');
    for(let i = 0;i < k.length; ++i) {
      k[i].innerHTML='';
    }
  }

  //遅刻時間のチェック
  BehindTime(e) {
    let t1 = dayjs(SelectedStaff.startTime,'H:mm');
    let t2 = dayjs(e.value,'H:mm');
    if(t1.diff(t2)>=0) {
      e.classList.remove('is-valid');
      e.classList.add('is-invalid');
    }
  }

  EarlyTime(e) {
    let t1 = dayjs(e.value,'H:mm');
    let t2 = dayjs(SelectedStaff.endTime,'H:mm');
    if(t1.diff(t2)>=0) {
      e.classList.remove('is-valid');
      e.classList.add('is-invalid');
    }
  }

  //早出開始時間
  EarlyFromTime() {
    let e = this.getEarlyFromTimeElm();
    if(!/^\d{1,2}:\d{2}$/.test(e.value)) {
      this.setInvalidClassName(e);
      return false;
    }

    let flg = true;
    if (dayjs(`${criterion_date}T${e.value}`).isValid()) {
      this.setValidClassName(e);
      flg = this.EarlyTimesConsistencyCheck1();
    }
    if(flg) return true;

    this.setInvalidClassName(e);
    return false;
  }

  //早出終了時間
  EarlyToTime(){
    let e = this.getEarlyToTimeElm();
    if(!/^\d{1,2}:\d{2}$/.test(e.value)) {
      this.setInvalidClassName(e);
      return false;
    }

    let flg = null;
    if (dayjs(`${criterion_date}T${e.value}`).isValid()) {
      this.setValidClassName(this.getEarlyFromTimeElm());
      this.setValidClassName(this.getEarlyToTimeElm());
      flg = this.EarlyTimesConsistencyCheck2();
    }
    if(flg===false) return false;

    if(this.getEarlyDulationTimeElm().value.length>0) {
      this.setValidClassName(this.getEarlyFromTimeElm());
      this.setValidClassName(this.getEarlyToTimeElm());
      this.setValidClassName(this.getEarlyDulationTimeElm());
      flg = this.EarlyTimesConsistencyCompleteCheck();
    }
    if(flg===false) return false;

    this.setValidClassName(e);
    return true;
  }

  //早出申請時間
  EarlyDulationTime() {
    let vEarlyDulationTime = document.getElementById('EarlyDulationTime');
    if(!/^\d{1,2}:\d{2}$/.test(vEarlyDulationTime.value)) {
      this.setInvalidClassName(vEarlyDulationTime);
      return false;
    }

    let EarlyDulationTime  = dayjs(`${criterion_date}T${vEarlyDulationTime.value}`);
    if (EarlyDulationTime.isValid()) {
      this.setValidClassName(vEarlyDulationTime);
      this.setValidClassName(document.getElementById('EarlyFromTime'));
      this.setValidClassName(document.getElementById('EarlyToTime'));
      return this.EarlyTimesConsistencyCompleteCheck();
    }
    this.setInvalidClassName(vEarlyDulationTime);
    return false;
  }


  EarlyTimesConsistencyCheck1() {
    let e = this.getEarlyFromTimeElm();
    let t1  = dayjs(`${criterion_date}T${e.value}`);
    let t2  = dayjs(`${criterion_date}T${SelectedStaff.startTime}`);

    if(!t1.isValid() || !t2.isValid()) return false;

    //開始時間と職員定時開始時間とのチェック
    if(t1.diff(t2)>0) {
      this.setInvalidClassName(e);
      this.setOvertimeAlertMessage(`E002_1:早出申請の開始時間が不正です。${SelectedStaff.startTime}以前を指定して下さい。`);
      return false;
    }

    this.setOvertimeAlertMessage('');
    this.setValidClassName(e);

    return true;
  }


  EarlyTimesConsistencyCheck2() {
    if(!this.EarlyTimesConsistencyCheck1()) return false;

    let e = this.getEarlyToTimeElm();

    let t1  = dayjs(`${criterion_date}T${e.value}`);
    if(t1.isValid() == false) {
      this.setInvalidClassName(e);
      this.setOvertimeAlertMessage(`E002_2:早出申請の終了時間が不正です。`);
      return false;
    }
    let t2  = dayjs(`${criterion_date}T${SelectedStaff.startTime}`);

    //開始時間と職員定時開始時間とのチェック
    if(t1.diff(t2)>0) {
      this.setInvalidClassName(e);
      this.setOvertimeAlertMessage(`E002_3:早出申請の終了時間が不正です。${SelectedStaff.startTime}以前を指定して下さい。`);
      return false;
    }

    //早出申請の開始時刻と終了時刻の論理チェック
    let e2 = this.getEarlyFromTimeElm();
    let t3  = dayjs(`${criterion_date}T${e2.value}`);
    if(t3.diff(t1)>=0) {
      this.setInvalidClassName(e2);
      this.setInvalidClassName(e);
      this.setOvertimeAlertMessage(`E002_4:早出申請の開始時間と終了時間が不整合。順番を確認してください。`);
      return false;
    }

    this.setOvertimeAlertMessage('');
    this.setValidClassName(e);
    return true;
  }

  EarlyTimesConsistencyCompleteCheck() {
    let vEarlyFromTime      = document.getElementById('EarlyFromTime');
    let vEarlyToTime        = document.getElementById('EarlyToTime');
    let vEarlyDulationTime  = document.getElementById('EarlyDulationTime');

    if(vEarlyFromTime.value.length<=0 &&
       vEarlyToTime.value.length<=0   &&
       vEarlyDulationTime.value.length<=0) {
      return true;
    }

    if(vEarlyFromTime.classList.contains('is-valid') &&
       vEarlyToTime.classList.contains('is-valid')   &&
       vEarlyDulationTime.classList.contains('is-valid'))
    {
      let t1  = dayjs(`${criterion_date}T${vEarlyFromTime.value}`);
      let t2  = dayjs(`${criterion_date}T${vEarlyToTime.value}`);
      let t3  = dayjs(`${criterion_date}T${vEarlyDulationTime.value}`);
      let t4  = dayjs(`${criterion_date}T0:00`);
      let t5  = dayjs(`${criterion_date}T${SelectedStaff.startTime}`);

      //開始終了の大小チェック
      if(t1.diff(t2)>0) {
        this.setInvalidClassName(vEarlyFromTime);
        this.setInvalidClassName(vEarlyToTime);
        this.setOvertimeAlertMessage('E001:早出申請の開始時間と終了時間の関係が不正です。');
        return false;
      }

      //開始時間と職員定時開始時間とのチェック
      if(t1.diff(t5)>0) {
        this.setInvalidClassName(vEarlyFromTime);
        this.setOvertimeAlertMessage(`E002_5:早出申請の開始時間が不正です。${SelectedStaff.startTime}以前を指定して下さい。`);
        return false;
      }

      //終了時間と職員定時開始時間とのチェック
      if(t2.diff(t5)>0) {
        this.setInvalidClassName(vEarlyToTime);
        this.setOvertimeAlertMessage(`E003:早出申請の終了時間が不正です。${SelectedStaff.startTime}以前を指定して下さい。`);
        return false;
      }

      //開始終了の範囲と申請時間のチェック
      if(t1.diff(t2)>t4.diff(t3)) {
        this.setInvalidClassName(vEarlyFromTime);
        this.setInvalidClassName(vEarlyToTime);
        this.setInvalidClassName(vEarlyDulationTime);
        this.setOvertimeAlertMessage(`E004:早出申請時間が不正です。開始時間と終了時間の範囲内で指定してください。`);
        return false;
      }
      this.setOvertimeAlertMessage('');
      this.setValidClassName(vEarlyFromTime);
      this.setValidClassName(vEarlyToTime);
      this.setValidClassName(vEarlyDulationTime);

    }
    return true;
  }

  CommonTimeCheck(e) {
    //書式チェック&&論理チェック
    if(/^\d{1,2}:\d{2}$/.test(e.value) && dayjs(`${criterion_date}T${e.value}`).isValid()) return true;
    this.setInvalidClassName(e);
    return false;
  }


  OverFromTime()
  {
    let elm = this.getOverFromTimeElm();
    if(!this.CommonTimeCheck(elm)) return false;

    let t1  = dayjs(`${criterion_date}T${SelectedStaff.endTime}`);
    let t2  = dayjs(`${criterion_date}T${elm.value}`);

    //職員の定時終了時間との比較(定時終了<指定時間)
    if(t1.diff(t2)>0)
    {
      this.setInvalidClassName(elm);
      this.setOvertimeAlertMessage(`E003_1:残業申請の開始時間がエラーです。${SelectedStaff.endTime}以降を指定して下さい。`);
      return false;
    }

    return true;
  }

  OverToTime()
  {
    if(!this.OverFromTime()) return false;

    let elm = this.getOverToTimeElm();
    if(!this.CommonTimeCheck(elm)) return false;

    let FromTime = this.getOverFromTimeElm();
    let t1 = dayjs(`${criterion_date}T${FromTime.value}`);
    let t2 = dayjs(`${criterion_date}T${elm.value}`);

    //残業開始時間と残業終了時間との比較(開始時間<終了時間)
    if(t1.diff(t2)>=0)
    {
      this.setInvalidClassName(elm);
      this.setOvertimeAlertMessage(`E003_1:残業開始時間と終了時間の関連性に不整合があります`);
      return false;
    }
    return true;
  }

  OverDulationTime() {
    if(!this.OverFromTime()) return false;
    if(!this.OverToTime())   return false;

    let elm = this.getOverDulationTimeElm();
    if(!this.CommonTimeCheck(elm)) return false;

    let FromTime = dayjs(`${criterion_date}T${this.getOverFromTimeElm().value}`);
    let toTime   = dayjs(`${criterion_date}T${this.getOverToTimeElm().value}`);
    let t3 = dayjs(`${criterion_date}T${this.getOverDulationTimeElm().value}`);
    let t4 = dayjs(`${criterion_date}T0:00`);

    if(toTime.diff(FromTime) < t3.diff(t4)) {
      this.setInvalidClassName(elm);
      this.setOvertimeAlertMessage(`E003_1:残業申請時間にエラーがあります。確認してください`);
      return false;
    }

    this.setOvertimeAlertMessage('');
    this.setValidClassName(this.getOverToTimeElm());
    this.setValidClassName(this.getOverFromTimeElm());
    this.setValidClassName(this.getOverDulationTimeElm());
    return true;
  }

  setOvertimeAlertMessage(v) {
    let alert = document.querySelector('#OvertimeModal .modal-body .alert');
    if(v.length<=0) {
      alert.innerHTML='';
      alert.style.display='none';
    } else {
      alert.innerHTML=v;
      alert.style.display='block';
    }
  }

  setInvalidClassName(e) {
    e.classList.remove('is-invalid', 'is-valid');
    e.classList.add('is-invalid');
  }

  setValidClassName(e) {
    e.classList.remove('is-invalid', 'is-valid');
    e.classList.add('is-valid');
  }

  getEarlyFromTimeElm() {
    return document.getElementById('EarlyFromTime');
  }

  getEarlyToTimeElm() {
    return document.getElementById('EarlyToTime');
  }

  getEarlyDulationTimeElm() {
    return document.getElementById('EarlyDulationTime');
  }


  getOverFromTimeElm() {
    return document.getElementById('OverFromTime');
  }

  getOverToTimeElm() {
    return document.getElementById('OverToTime');
  }

  getOverDulationTimeElm() {
    return document.getElementById('OverDulationTime');
  }


}