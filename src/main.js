const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const rp = require('request-promise');
const config = require('./config');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
let exec = require('child_process').exec;

//==========

const myBot = ['u7a92b4c0c87a2dfeedec343276cea972','uf51ed4f092b7686f297a23ed3789ae34','u5373e15ec8d7c4e3983098440b62587a','u73095ed1d4406202ddf2d26618a05cac','uf71b8e10ca3e778d2b409b072cb0597f','u8df2040f34fed7425e9b263ea1dbfe9b','u7a8804ae9c54c18dfd2000351c429b86','u4037c6b6ab3aeb47010fd464b227e603];
// -tips biar botnya gk error mulu- ];//INSERT YOUR ADMIN MID HERE
var vx = {};var midnornama = "";var pesane = "";var kickhim = "";var waitMsg = "no";//DO NOT CHANGE THIS
var banList = [];//Banned list

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function isBanned(banList, param) {
    return banList.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function isTGet(string,param){
	return string.includes(param);
}

class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.creator = [];
        this.stateStatus = {
            mute: 0,
            salam: 1,
            qr: 0,
            kick: 0,
            cancel: 0,
            reinvite: 0,
            protection: 0,
        }

      
		this.keyhelp = "\n\
====================\n\
|   A̸͟͞L̸͟͞L̸͟͞ M̸͟͞E̸͟͞M̸͟͞B̸͟͞E̸͟͞R̸͟͞   |\n\
====================\n\
¤>Set\n\
¤>Reset\n\
¤>Read\n\
¤>Cekid\n\
¤>Ginfo\n\
¤>Gcreator\n\
¤>Msg\n\
¤>Myid\n\
¤>Gift\n\
¤>Creator\n\
¤>Sendcontact\n\
¤>Sp [speed]\n\
¤>join link qr\n\
¤>rn [responsename]\n\
====================\n\
D̸͟͞E̸͟͞S̸͟͞T̸͟͞R̸͟͞O̸͟͞Y̸͟͞E̸͟͞R̸͟͞ T̸͟͞E̸͟͞A̸͟͞M̸͟͞\n\
====================";
   //============   
  this.cmad = "\
======================\n\
|       A̸͟͞D̸͟͞M̸͟͞I̸͟͞N̸͟͞.      |\n\
======================\n\
▫Mute\n\
▫unmute\n\
▫Kill「@」\n\
▫Add staff\n\
▫Del staff\n\
▫Zer:CreateGroup\n\
▫addcontact\n\
▫spam\n\
▫Tagall\n\
▫Gurl\n\
▫Bc [broadcast]\n\
▫Dat [Date/time]\n\
▫Sb [statusbot]\n\
▫Ban [banned]\n\
▫Unban\n\
▫Banlist\n\
▫Kickall\n\
▫cancel\n\
▫botleft\n\
▫L:bye\n\
========================\n\
|  D̸͟͞E̸͟͞S̸͟͞T̸͟͞R̸͟͞O̸͟͞Y̸͟͞E̸͟͞R̸͟͞ T̸͟͞E̸͟͞A̸͟͞M̸͟͞.  |\n\
========================";
 
        var that = this;
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            if(waitMsg == "yes" && operation.message.from_ == vx[0] && this.stateStatus.mute != 1){
				this.textMessage(txt,message,message.text)
			}else if(this.stateStatus.mute != 1){this.textMessage(txt,message);
			}else if(txt == "unmute" && isAdminOrBot(operation.message.from_) && this.stateStatus.mute == 1){
			    this.stateStatus.mute = 0;
			    this._sendMessage(message,"ヽ(^。^)ノ")
		    }else{console.info("muted");}
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1 && !isAdminOrBot(operation.param2)) {//someone inviting..
            this.cancelAll(operation.param1);
        }
      
        /*if(operation.type == 25 || operation.type == 26) {
            this._client.removeAllMessages(operation.param1);
        }*/
      
      //===================operation protect============
        if(operation.type == 13 && this.stateStatus.protection == 1) { //notif invite
             if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
             }
        }
      
        if(operation.type == 17 && this.stateStatus.protection == 1) { //notif accept group invitation
             if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
             }
        }
      
        if(operation.type == 32 && this.stateStatus.protection ==1) { //notif cancel invite
             // op1 = group nya
             // op2 = yang 'nge' cancel
             if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
             }
         }
      
         if(operation.type == 11 && this.stateStatus.protection == 1) { // url
             // op1 = group nya
             // op2 = yang 'open/close' url
             if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
             }

         }
      
         if(operation.type == 19) { //auoto reinvite
             if(isAdminOrBot(operation.param2)) {
                this._inviteIntoGroup(operation.param1,[operation.param2]);
             }
         }
      
      //==========salam===========
      
       if(operation.type == 15 && this.stateStatus.salam == 1) {
             let out = new Message();
             out.to = operation.param1;

             out.text = "hmmmmmm"
			     this._client.sendMessage(0, out);
       }
      
      
         if(operation.type == 16 && this.stateStatus.salam == 1) {
                let itil = new Message();
                itil.to = operation.param1;
                itil.text = "Hellow guys, I am come back 😎\n\n-D̸͟͞E̸͟͞S̸͟͞T̸͟͞R̸͟͞O̸͟͞Y̸͟͞E̸͟͞R̸͟͞ T̸͟͞E̸͟͞A̸͟͞M̸͟͞-"
                this._client.sendMessage(0, itil);
         }

           

      
      //==========================
		
		if(operation.type == 15 && this.stateStatus.reinvite==1&& isAdminOrBot(operation.param2)) {//ada yang leave
		    let babay = new Message();
			babay.to = operation.param1;
			babay.toType = 2;
			babay.text = "hmmmmm";
			this._invite(operation.param1,[operation.param2]);
			this._client.sendMessage(0, babay);
		}else if(operation.type == 15 && !isAdminOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0102",seq,operation.param2,1);
		}
	
        if(operation.type == 19) { //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
			let kasihtau = new Message();
			kasihtau.to = operation.param1;
            if(isAdminOrBot(operation.param3)) {
				this.textMessage("0105",kasihtau,operation.param3,1);
                //this._inviteIntoGroup(operation.param1,operation.param3);
				//kasihtau.text = "Jangan kick botku !";
				//this._client.sendMessage(0, kasihtau);
				var kickhim = 'yes';
            }
            if(!isAdminOrBot(operation.param3)){
				this.textMessage("0106",kasihtau,operation.param3,1);
				if(!isAdminOrBot(operation.param2)){
					kasihtau.text = "Jangan main kick woy !";
				    this._client.sendMessage(0, kasihtau);
				}
				if(this.stateStatus.protection == 1){
					var kickhim = 'yes';
				}
            } 
			if(kickhim=='yes'){
				if(!isAdminOrBot(operation.param2)){
				    this._kickMember(operation.param1,[operation.param2]);
				}var kickhim = 'no';
			}

        }
      
		if(operation.type == 11 && this.stateStatus.qr == 1){//update group (open qr)
		    let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.qr == 1){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0104",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.qr == 0){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}

        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { // diinvite
            if(isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1)
            } else {
                return this._cancel(operation.param1,operation.param2);
              }
        }
        this.getOprationType(operation);
    }
  
    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }
	
	async matchPeople(param, nama) {//match name
	    for (var i = 0; i < param.length; i++) {
            let orangnya = await this._client.getContacts([param[i]]);
		    if(orangnya[0].displayName == nama){
			    return orangnya;
				break;
		    }
        }
	}
	
	async isInGroup(param, mid) {
		let { listMember } = await this.searchGroup(param);
	    for (var i = 0; i < listMember.length; i++) {
		    if(listMember[i].mid == mid){
			    return listMember[i].mid;
				break;
		    }
        }
	}
	
	async isItFriend(mid){
		let listFriends = await this._getAllContactIds();let friend = "no";
		for(var i = 0; i < listFriends.length; i++){
			if(listFriends[i] == mid){
				friend = "ya";break;
			}
		}
		return friend;
	}

	
	async searchRoom(rid) {
        let thisroom = await this._getRoom(rid);
        let listMemberr = thisroom.contacts.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMemberr
        }
    }

    setState(seq,param) {
		if(param == 1){
			let isinya = "=== [Setting] ===\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" ▶ 🔒\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" ▶ 🔓\n";
					}
                }
            }this._sendMessage(seq,isinya);
		}else{
        if(isAdminOrBot(seq.from_)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
			let isinya = "=== [Setting] ===\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" ▶ 🔒\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" ▶ 🔓\n";
					}
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
			this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`Hanya akses admin!`);
        }}
    }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }
	
	async tagAlls(seq){
		let { listMember } = await this.searchGroup(seq.to);
			seq.text = "";
			let mentionMemberx = [];
            for (var i = 0; i < listMember.length; i++) {
				if(seq.text == null || typeof seq.text === "undefined" || !seq.text){
					let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
				    seq.text += "@"+namanya+" \n";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember1 = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z;
                        let mentionz = `{"S":"0","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember1);
				    //const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
				    //seq.contentMetadata = tag.cmddata;
				    //this._client.sendMessage(0, seq);
				}else{
				    let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
					let kata = seq.text.split("");
					let panjang = kata.length;
				    seq.text += "@"+namanya+" \n";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember);
				}
			}
			const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMemberx}]}` }}
			seq.contentMetadata = tag.cmddata;
			this._client.sendMessage(0, seq);
	}
	
	mension(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        mentionStrings.push('▫'+listMember.displayName+'\n');
        mid.push(listMember.mid);
        let strings = mentionStrings.join('');
        let member = strings.split('▫').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

    async recheck(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }
	
	async leftGroupByName(payload) {
        let groupID = await this._getGroupsJoined();
	    for(var i = 0; i < groupID.length; i++){
		    let groups = await this._getGroups(groupID);
            for(var ix = 0; ix < groups.length; ix++){
                if(groups[ix].name == payload){
                    this._client.leaveGroup(0,groups[ix].id);
				    break;
                }
            }
	    }
    }

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }
 
    async textMessage(textMessages, seq, param, lockt) {
        let [ cmd, ...payload ] = textMessages.split(' ');
        payload = payload.join(' ');
		const gTicket = textMessages.split('line://ti/g/');
		const linktxt = textMessages.split('http');
        const txt = textMessages.toLowerCase();
        const messageID = seq.id;
		const cot = textMessages.split('@');
		const com = textMessages.split(':');
		const cox = textMessages.split(' ');
      
      //===================
      
        var group = await this._getGroup(seq.to);
        var date = new Date();

        var bulanku = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        var hariku = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum&#39;at', 'Sabtu'];
        var tanggal = date.getDate();
        var bulan = date.getMonth(),
            bulan = bulanku[bulan];
        var hariIni = date.getDay(),
            hariIni = hariku[hariIni];
        var tahun = date.getFullYear();
      
      //============COMMAND==========

         //Zer:CreateGroup <jumlah>-<NamaGrup>/<mid>
         //Zer:CreateGroup 100-NamaGrupnya/midkorban
        if(cmd == 'Zer:CreateGroup' && isAdminOrBot(seq.from)) { 
            const [ j, u ] = payload.split('-');
            const [ n, m ] = u.split('/');
            for (var i = 0; i < j; i++) {
                this._createGroup(`${n}`,[m]);
            }
        }
      
        if(txt == 'dat' && isAdminOrBot(seq.from_))  {
               let menit = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','00'];
               let jam = ['11','12','13','14','15','16','17','18','19','20','21','23','00','01','02','03','04','05','06','07','08','09','10','11'];
               let hh = jam[date.getHours()];
               let mm = menit[date.getMinutes()];
               let ss = menit[date.getSeconds()];
               this._sendMessage(seq, `🔘 Pukul, ${hh} : ${mm} : ${ss} WIB\n\n🔘 ${hariIni}, ${tanggal} ${bulan} ${tahun}`);
        }
      
        if(txt == 'gcreator') {
            let creator = group.creator.mid;
            seq.contentType=13;
            seq.contenPreview= null,
            seq.contentMetadata = { mid: `${creator}` };
            this._client.sendMessage(1, seq);
        }
      
        if(txt == 'creator') {
            seq.contentType=13;
            seq.contenPreview= null,
            seq.contentMetadata = { mid: seq.from_ };
            this._client.sendMessage(1, seq);
        }
      
        if(txt == 'rn' && isAdminOrBot(seq.from_)) {
            this._sendMessage(seq, 'Lцғғұ');
        }
      
        if(txt == 'gift') {
            seq.contentType = 9
            seq.contentMetadata = {'PRDID': 'a9ed993f-a4d8-429d-abc0-2692a319afde','PRDTYPE': 'THEME','MSGTPL': '6'};
            this._client.sendMessage(1, seq);
        }
      
        if(txt == 'set') {
            this._sendMessage(seq, `Read point telah di set!`);
            this.removeReaderByGroup(seq.to);
        }
      
        if(txt == 'reset') {
            this.checkReader = []
            this._sendMessage(seq, `Read point telah di reset!`);
        }
    
        if(txt == 'read') {
            let rec = await this.recheck(this.checkReader,seq.to);
            const mentions = await this.mention(rec);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
        }
      
        if(txt == "banlist" && isAdminOrBot(seq.from_)) {
           seq.text = "⚠ List Banned ⚠\n________________\n";
           for(var i = 0; i < banList.length; i++){
			     let orangnya = await this._getContacts([banList[i]]);
           seq.text += "▫"+orangnya[0].displayName+"\n";
           }
           this._sendMessage(seq,seq.text);
        }

        if(txt == "l:bye" || txt =="bye all" && isAdminOrBot(seq.from_)) {
           this._client.leaveGroup(0,seq.to);
        }
     
        if(cmd == 'Bc' && isAdminOrBot(seq.from_)) {
               const [  j, kata ] = payload.split(':');
               for (var i=0; i <j; i++) {
               this._sendMessage(seq,`${kata}`);
               }
        }
      
        if(cmd == 'spam' && isAdminOrBot(seq.from_)) {
              for(var i = 0; i < 100;  i++) {
                this._sendMessage(seq,'UP😂\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nMAMPUS😛');
              }
        }
      
        if(cmd == 'Kill' && isAdminOrBot(seq.from_)){
           let target = payload.replace('@','');
           let group = await this._getGroups([seq.to]);
           let gm = group[0].members;
              for(var i = 0; i < gm.length; i++){
                     if(gm[i].displayName == target){
                                  target = gm[i].mid;
                     }
               }
               this._kickMember(seq.to,[target]);
        }
      
        if(cmd == 'join' || cmd == 'Join') { //untuk join group pake qrcode contoh: join line://anu/g/anu
            const [ ticketId ] = payload.split('g/').splice(-1);
            let { id } = await this._findGroupByTicket(ticketId);
            await this._acceptGroupInvitationByTicket(id,ticketId);
        }
      
       
      

      
      //============================
		
		if(vx[1] == "sendcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(txt == "me"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: seq.from_ };
				this._client.sendMessage(0, seq);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: pment };
				this._client.sendMessage(0, seq);
			}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: txt };
				this._client.sendMessage(0, seq);
			}else{
				this._sendMessage(seq,"Tag orangnya !");
			}
		}
		if(txt == "sendcontact" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'sendcontact' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "addcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(seq.contentType == 13){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;let midnya = pment;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = txt;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else{
				this._sendMessage(seq,"# How to addcontact\n-Kirim Contact Orang Yang Mau Di Add\n-Kirim Mid Orang Yang Mau Di Add\n-Atau Tag Orang Yang Mau Di Add");
			}
		}
		if(txt == "addcontact" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya atau kirim kontaknya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'addcontact' && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "cekid" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(seq.contentType == 13){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let bang = new Message();
				bang.to = seq.to;
				bang.text = midnya;
				this._client.sendMessage(0, bang);
			}else if(txt == "me"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = seq.from_.toString();
				this._client.sendMessage(0, seq);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let cekid = new Message();
				cekid.to = seq.to;
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				
				cekid.text = JSON.stringify(pment).replace(/"/g , "");
				this._client.sendMessage(0, cekid);
			}else{
				this._sendMessage(seq,"# How to cekid\nTag orangnya / kirim kontak yang mau di-cek idnya !");
			}
		}
		if(txt == "cekid" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Cek ID ready #Kirim kontaknya");
				this._sendMessage(seq,"Atau bisa juga @tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'cekid' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		

		if(vx[1] == "msg" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(vx[2] == "arg1" && vx[3] == "mid" && cot[1]){
				let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, Tulis Pesannya"
				this._client.sendMessage(0,bang);
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let midnya = JSON.stringify(pment);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, Tulis Pesannya"
				this._client.sendMessage(0,bang);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && panjang.length > 30){
				this._sendMessage(seq,"OK !, Tulis Pesannya");
				vx[4] = txt;
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "mid"){
				let panjangs = vx[4].split("");
				let kirim = new Message();let bang = new Message();
				bang.to = seq.to;
				if(panjangs[0] == "u"){
					kirim.toType = 0;
				}else if(panjangs[0] == "c"){
					kirim.toType = 2;
				}else if(panjangs[0] == "r"){
					kirim.toType = 1;
				}else{
					kirim.toType = 0;
				}
				bang.text = "Pesan Berhasil Terkirim !";
				kirim.to = vx[4];
				kirim.text = txt;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";vx[4] = "";
				this._client.sendMessage(0, kirim);
				this._client.sendMessage(0, bang);
			}else{
				this._sendMessage(seq,"# How to msg\nKirim Kontak yang mau dikirimkan pesan !");
			}

		}if(txt == "msg" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[3] = "mid";
			    this._sendMessage(seq,"Msg => Ready!");
				this._sendMessage(seq,"Kirim Kontak orang yang mau dikirimkan pesan !");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'msg' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "ban" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(cot[1]){
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let msg = new Message();msg.to = seq.to;
				if(isBanned(banList,pment)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					msg.text = cot[1]+" sudah masuk daftar banlist...";
					this._client.sendMessage(0,msg);
				}else{
					msg.text = "Banned => Success !";
					this._client.sendMessage(0, msg);
			        banList.push(pment);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else if(seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let msg = new Message();msg.to = seq.to;
				if(isBanned(banList,midnya)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					msg.text = "Dia sudah masuk daftar banlist...";
					this._client.sendMessage(0, msg);
				}else{
					msg.text = "Banned => Success !";
					this._client.sendMessage(0, msg);
			        banList.push(midnya);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else if(panjang.length > 30 && panjang[0] == "u"){
				if(isBanned(banList,txt)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"Dia sudah masuk daftar banlist...");
				}else{
					let msg = new Message();msg.to = seq.to;msg.text = "Berhasil terbanned !";
					this._client.sendMessage(0, msg);
			        banList.push(txt);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else{
					this._sendMessage(seq,"# Kirim kontak / tag orangnya yang mau dibanned !");
			}
		}
		if(txt == "ban" && isAdminOrBot(seq.from_)) {
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Banned => Ready !");
				vx[2] = "arg1";
				this._sendMessage(seq,"# Kirim kontak / tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "ban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "unban" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(cot[1]){
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, pment)){
					let ment = banList.indexOf(pment);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "Unbanned => Success !";
					this._client.sendMessage(0,bang);
				}else{
					bang.text = "Dia gk masuk daftar banned bos !";
					this._client.sendMessage(0, bang);
				}
			}else if(seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, midnya)){
					let ment = banList.indexOf(midnya);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "Unbanned => Success !";
					this._client.sendMessage(0,bang);
				}else{
					bang.text = "Dia gk masuk daftar banned bos !";
					this._client.sendMessage(0, bang);
				}
			}else if(panjang.length > 30 && panjang[0] == "u"){
				let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, txt)){
					let ment = banList.indexOf(txt);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "Unbanned => Success !";
					this._client.sendMessage(0,bang);
				}else{
					this._sendMessage(seq,"Dia gk masuk daftar banned bos !");
				}
			}else{
				this._sendMessage(seq,"# Kirim kontaknya / tag orangnya yang mau di-unban");
			}
		}
		if(txt == "unban" && isAdminOrBot(seq.from_)) {
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
				seq.text = "";
				for(var i = 0; i < banList.length; i++){
					let orangnya = await this._getContacts([banList[i]]);
				    seq.text += "⚠ "+orangnya[0].displayName+"\n";
				}
				this._sendMessage(seq,seq.text);
			    this._sendMessage(seq,"Unbanned => Ready !");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "unban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		
		
		if(vx[1] == "botleft" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(txt == "group" && vx[2] == "arg1"){
				vx[3] = txt;
				this._sendMessage(seq,"OK, Apa nama groupnya bang ?");
				vx[2] = "arg2";
			}else if(vx[3] == "group" && vx[2] == "arg2"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this.leftGroupByName(textMessages);
			}
		}
		if(txt == "botleft" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
				waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Left dari ? #group");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "botleft" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "mute" && isAdminOrBot(seq.from_)){
			this.stateStatus.mute = 1;
			this._sendMessage(seq,"(*´﹃｀*)")
		}
		
        if(txt == 'cancel' && this.stateStatus.cancel == 1 && isAdminOrBot(seq.from_)) {
            this.cancelAll(seq.to);
        }else if(txt == "cancel" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
      

       if(txt == 'speed' || txt == 'sp' && !isBanned(banList, seq.from_)) {
            const curTime = Math.floor(Date.now() / 1000);
            //this._sendMessage(seq,'processing....');
            const rtime = Math.floor(Date.now() / 1000) - curTime;
            this._sendMessage(seq, `${rtime} second`);
        }else if(txt == 'sp' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
//==========================

        if(txt === 'kickall' || txt === 'salken' && this.stateStatus.kick == 1) {
            if(isAdminOrBot(seq.from_) && seq.toType == 2) {
               let { listMember } = await this.searchGroup(seq.to);
               for (var i = 0; i < listMember.length; i++) {
                  if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                  }
               }
            }
        }else if(txt === 'kickall' && !isAdminOrBot(seq.from_) && seq.toType == 2){this._sendMessage(seq, 'Oh tidakk bisa !');}
      
   //========================
		
		if(txt == 'key') {
			let botOwner = await this._client.getContacts([myBot[0]]);
            let { mid, displayName } = await this._client.getProfile();
			let key2 = "\
====================\n\
| BotName   : "+displayName+"\n\
| BotStatus : Working\n\
| BotOwner  : "+botOwner[0].displayName+"\n\
====================\n";
			seq.text = key2 += this.keyhelp;
			this._client.sendMessage(0, seq);
		}
      
    if(txt == 'cm' && isAdminOrBot(seq.from_)) {
      seq.text = this.cmad;
      this._client.sendMessage(0, seq);
    }
  //=====================
		
		if(txt == '0101') {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Halo @'+namanya+', Selamat datang bro ! Salam Kenal ^_^';
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }
		
		if(txt == "tagall" && seq.toType == 2 && isAdminOrBot(seq.from_)) {
			await this.tagAlls(seq);
		}else if(txt == 'tagall' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == '0103' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){}else{ax.preventJoinByTicket = true;await this._client.updateGroup(0, ax);}
		}
		if(txt == '0104' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){ax.preventJoinByTicket = false;await this._client.updateGroup(0, ax);}else{}
		}
		
		if(txt == '0102' && lockt == 1) {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Goodbye ! @'+namanya;
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }

		
		if(txt == "kickban" && isAdminOrBot(seq.from_)){
			for(var i = 0; i < banList.length; i++){
				let adaGk = await this.isInGroup(seq.to, banList[i]);
				if(typeof adaGk !== "undefined" && adaGk){
					this._kickMember(seq.to,[adaGk]);
				}
			}
		}else if(txt == "kickban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "sb" && isAdminOrBot(seq.from_)) {
			this.setState(seq,1)
		}
		
        const action = ['cancel on','cancel off','kick on','kick off','salam on','salam off','protection off','protection on','reinvite on','reinvite off','qr on','qr off']
        if(action.includes(txt)) {
            this.setState(seq,0)
        }
	
        if(txt == 'myid') {
            this._sendMessage(seq,"ID Kamu: "+seq.from_);
        }

		if(txt == 'ginfo' && !isBanned(banList, seq.from_)) {
            let groupInfo = await this._client.getGroup(seq.to);let gqr = 'open';
			let createdT64 = groupInfo.createdTime.toString().split(" ");
			let createdTime = await this._getServerTime(createdT64[0]);
			let gid = seq.to;
			let gname = groupInfo.name;
			let memberCount = groupInfo.members.length;
			let gcreator = groupInfo.creator.displayName;
			let pendingCount = 0;
			if(groupInfo.invitee !== null){
				pendingCount = groupInfo.invitee.length;
			}
			let gcover = groupInfo.pictureStatus;
			let qr = groupInfo.preventJoinByTicket;
			if(qr === true){
				gqr = 'close';
			}
			let bang = new Message();
			bang.to = seq.to;
			
			bang.text = "◾ Group Name:\n"+gname+"\n\
\n◾ Group ID:\n"+gid+"\n\
\n◾ Group Creator:\n"+gcreator+"\n\
\n◾ Group CreatedTime:\n"+createdTime+"\n\
\n◾ Member: "+memberCount+"\n\
\n◾ Pending: "+pendingCount+"\n\
\n◾ QR: "+gqr;
            this._client.sendMessage(0,bang);
        }else if(txt == 'ginfo' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        const joinByUrl = ['gurl'];
        if(joinByUrl.includes(txt)) {
          if(isAdminOrBot(seq.from_)) {
            this._sendMessage(seq,`Updating group ...`);
            let updateGroup = await this._getGroup(seq.to);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to)
            this._sendMessage(seq,`Link group = line://ti/g/${groupUrl}`);
          }
       }
		
		if(txt == "0105" && lockt == 1){
			let aas = new Message();
			aas.to = param;
			let updateGroup = await this._getGroup(seq.to);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to);
			aas.toType = 0;
			aas.text = `joinline://ti/g/${groupUrl}`;
			this._client.sendMessage(0, aas);
		}
		
		if(txt == "0106" && lockt == 1){
			let friend = await this.isItFriend(param);
			if(friend == "ya"){
       //await this._client.findAndAddContactsByMid(0, param);
				this._client.inviteIntoGroup(0,seq.to,[param]);
			}else{this._client.inviteIntoGroup(0,seq.to,[param]);}
		}
		
		if(gTicket[0] == "join" && isAdminOrBot(seq.from_)){
			let sudah = "no";
			let grp = await this._client.findGroupByTicket(gTicket[1]);
			let lGroup = await this._client.getGroupIdsJoined();
			for(var i = 0; i < lGroup.length; i++){
				if(grp.id == lGroup[i]){
					sudah = "ya";
				}
			}
			if(sudah == "ya"){
				let bang = new Message();bang.to = seq.to;bang.text = "Gagal join bang, eneng udah masuk groupnya";
				this._client.sendMessage(0,bang);
			}else if(sudah == "no"){
				await this._acceptGroupInvitationByTicket(grp.id,gTicket[1]);
			}
		}

    }
  

}

module.exports = new LINE();
