(() => {
  const STORE = 'commonplace-household-v1';
  const palette = ['avatar-sage', 'avatar-coral', 'avatar-lilac', 'avatar-blue', 'avatar-yellow'];
  const initials = name => name.trim().split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const dateISO = offset => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() + offset); return d.toISOString().slice(0,10); };
  const initialData = () => ({
    household: 'Maple House', members: [
      {id:'jamie',name:'Jamie Dawson',role:'You · House admin',color:palette[0]},
      {id:'morgan',name:'Morgan Kim',role:'Roommate',color:palette[1]},
      {id:'alex',name:'Alex Lee',role:'Roommate',color:palette[2]},
      {id:'riley',name:'Riley Chen',role:'Roommate',color:palette[3]}
    ],
    tasks: [
      {id:'t1',title:'Wipe down the kitchen',category:'cleaning',assignee:'jamie',date:dateISO(0),done:false},
      {id:'t2',title:'Take the bins to the curb',category:'garbage',assignee:'morgan',date:dateISO(1),done:false},
      {id:'t3',title:'Sweep the front steps',category:'snow',assignee:'alex',date:dateISO(2),done:false},
      {id:'t4',title:'Give the bathroom a refresh',category:'cleaning',assignee:'riley',date:dateISO(3),done:false},
      {id:'t5',title:'Bring the bins back in',category:'garbage',assignee:'jamie',date:dateISO(4),done:false}
    ],
    shopping: [
      {id:'s1',name:'Oat milk',addedBy:'Morgan',bought:false},{id:'s2',name:'Dish soap',addedBy:'Alex',bought:false},
      {id:'s3',name:'Lemons',addedBy:'Jamie',bought:false},{id:'s4',name:'Kitchen sponges',addedBy:'Riley',bought:false}
    ],
    expenses: [
      {id:'e1',description:'Weekly groceries',amount:86.40,payer:'morgan',split:['jamie','morgan','alex','riley'],date:dateISO(-1)},
      {id:'e2',description:'Dish soap & supplies',amount:18.75,payer:'jamie',split:['jamie','morgan','alex','riley'],date:dateISO(-3)},
      {id:'e3',description:'Internet bill',amount:64.00,payer:'alex',split:['jamie','morgan','alex','riley'],date:dateISO(-9)}
    ]
  });
  let data;
  try { data = JSON.parse(localStorage.getItem(STORE)) || initialData(); } catch { data = initialData(); }
  const save = () => localStorage.setItem(STORE, JSON.stringify(data));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const member = id => data.members.find(m => m.id === id) || data.members[0];
  const avatar = m => `<span class="avatar ${m.color}">${esc(initials(m.name))}</span>`;
  const money = n => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
  const humanDate = s => {const d=new Date(`${s}T12:00:00`); return d.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'});};
  const dateParts = s => {const d=new Date(`${s}T12:00:00`);return {day:d.toLocaleDateString('en-CA',{day:'2-digit'}),dow:d.toLocaleDateString('en-CA',{weekday:'short'}).toUpperCase()};};
  const categoryIcon = c => c==='garbage'?'▤':c==='snow'?'❄':'✳';
  const toast = msg => { const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400);};
  function renderPeople(){
    $('#peopleList').innerHTML=data.members.map((m,i)=>`<div class="person-row">${avatar(m)}<div><div class="person-name">${esc(m.name)}</div><div class="person-role">${i===0?'Keeping things humming':'Roommate'}</div></div><span class="person-status">${i===0?'✦ admin':'At home'}</span></div>`).join('');
    $('#taskAssignee').innerHTML=data.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
    $('#expensePayer').innerHTML=data.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
    $('#memberChecks').innerHTML=data.members.map((m,i)=>`<label class="member-check"><input type="checkbox" value="${m.id}" ${i===0?'checked':''}><span>${esc(m.name)}</span></label>`).join('');
  }
  function taskHTML(t, compact=false){const m=member(t.assignee);return `<div class="task-row ${t.done?'completed':''}"><span class="task-symbol ${t.category}">${categoryIcon(t.category)}</span><div><div class="task-name">${esc(t.title)}</div><div class="task-meta">${t.category==='snow'?'Outside':t.category==='garbage'?'Garbage day':'Cleaning'}</div></div><span class="task-assignee">${avatar(m)}${esc(m.name.split(' ')[0])}</span><span class="task-date">${humanDate(t.date)}</span></div>`;}
  function renderOverview(){
    const open=data.tasks.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date));
    $('#overviewTasks').innerHTML=open.slice(0,3).map(t=>taskHTML(t,true)).join('') || '<div class="empty-state">All caught up. Lovely work.</div>';
    $('#statChores').textContent=open.length;$('#choreNavCount').textContent=open.length;
    const needed=data.shopping.filter(x=>!x.bought);$('#statShopping').textContent=needed.length;
    $('#statOwed').innerHTML=`$${(openBalance('jamie')>0?openBalance('jamie'):0).toFixed(2).split('.')[0]}<span class="decimal">.${(openBalance('jamie')>0?openBalance('jamie'):0).toFixed(2).split('.')[1]}</span>`;
  }
  function renderChores(){
    const filter=$('#taskFilters .selected')?.dataset.filter||'all';
    const tasks=[...data.tasks].sort((a,b)=>a.date.localeCompare(b.date)).filter(t=>filter==='all'||t.category===filter);
    $('#scheduleList').innerHTML=tasks.length?tasks.map(t=>{const m=member(t.assignee),d=dateParts(t.date);return `<article class="schedule-card ${t.done?'completed':''}"><div class="date-box"><strong>${d.day}</strong><span>${d.dow}</span></div><span class="task-symbol ${t.category}">${categoryIcon(t.category)}</span><div><div class="task-name">${esc(t.title)}</div><div class="category-label">${t.category==='snow'?'Snow shoveling':t.category}</div></div><span class="task-assignee">${avatar(m)}${esc(m.name)}</span><span class="task-date">${t.done?'Done':humanDate(t.date)}</span><button class="task-check ${t.done?'done':''}" data-task="${t.id}" title="${t.done?'Mark incomplete':'Mark complete'}">✓</button></article>`}).join(''):'<div class="empty-state">No tasks here yet. Add one to get everyone started.</div>';
    const now=new Date(), end=new Date();end.setDate(end.getDate()+6);$('#weekRange').textContent=`${now.toLocaleDateString('en-CA',{month:'short',day:'numeric'})} — ${end.toLocaleDateString('en-CA',{month:'short',day:'numeric'})}`;
  }
  function renderShopping(){
    const needed=data.shopping.filter(x=>!x.bought),bought=data.shopping.filter(x=>x.bought);
    $('#shoppingHeading').innerHTML=`On the list <span>(${needed.length})</span>`;
    $('#shoppingList').innerHTML=(needed.length?needed.map(item=>shopHTML(item)).join(''):'<div class="empty-state">Nothing on the list. Looks like you are well stocked.</div>')+(bought.length?`<div class="eyebrow" style="padding:17px 3px 4px">PICKED UP</div>${bought.map(item=>shopHTML(item)).join('')}`:'');
  }
  function shopHTML(i){return `<div class="shopping-item ${i.bought?'bought':''}"><button class="shop-check" data-shop-check="${i.id}" aria-label="${i.bought?'Unmark':'Mark'} ${esc(i.name)}">✓</button><span class="shop-name">${esc(i.name)}</span><span class="shop-added">Added by ${esc(i.addedBy)}</span><button class="shop-delete" data-shop-delete="${i.id}" aria-label="Remove ${esc(i.name)}">×</button></div>`;}
  function openBalance(id){let total=0;for(const e of data.expenses){const included=e.split.includes(id),share=included?e.amount/e.split.length:0;if(e.payer===id)total+=e.amount-share;else if(included)total-=share;}return total;}
  function renderExpenses(){
    const view=$('#expenseFilter').value, expenses=[...data.expenses].sort((a,b)=>b.date.localeCompare(a.date)).filter(e=>view==='all'||new Date(e.date).getMonth()===new Date().getMonth());
    const spent=expenses.reduce((a,e)=>a+e.amount,0);$('#houseSpending').textContent=money(spent);
    const my=openBalance('jamie');$('#myBalance').textContent=`${my>=0?'+':''}${money(my)}`;$('#myBalance').style.color=my<0?'#ae7565':'#3b6957';
    $('#expenseList').innerHTML=expenses.length?expenses.map(e=>{const m=member(e.payer);return `<div class="expense-row"><span class="expense-icon">${e.description.toLowerCase().includes('internet')?'⌁':'⌑'}</span><div><div class="expense-title">${esc(e.description)}</div><div class="expense-date">${humanDate(e.date)} · paid by ${esc(m.name.split(' ')[0])}</div></div><div class="expense-people">${e.split.length} housemates</div><div class="expense-amount">${money(e.amount)}</div><div class="expense-share">${money(e.amount/e.split.length)} each</div></div>`}).join(''):'<div class="empty-expenses">No expenses in this view yet. Add the first one.</div>';
    $('#balancesGrid').innerHTML=data.members.map(m=>{const b=openBalance(m.id);const state=Math.abs(b)<.01?'All settled':b>0?'Is owed':'Owes the house';return `<div class="balance-person">${avatar(m)}<div><div class="balance-name">${esc(m.name.split(' ')[0])}</div><div class="balance-state">${state}</div></div><span class="balance-amount ${b<0?'negative':''}">${b>0?'+':''}${money(Math.abs(b))}</span></div>`}).join('');
  }
  function render(){renderPeople();renderOverview();renderChores();renderShopping();renderExpenses();save();}
  function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));$$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.view===view));const labels={overview:'Overview',chores:'Chore schedule',shopping:'Shopping list',expenses:'Shared expenses'};$('#pageCrumb').textContent=labels[view]||'Overview';$('#sidebar').classList.remove('open');window.location.hash=view==='overview'?'overview':view;}
  $$('[data-view]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.dataset.view)}));$$('[data-goto]').forEach(a=>a.addEventListener('click',()=>go(a.dataset.goto)));
  $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  const open=(id)=>$(id).showModal();
  $('#addTaskBtn').addEventListener('click',()=>{ $('#taskForm').reset();$('#taskForm [name=date]').value=dateISO(1);open('#taskDialog'); });
  $('#quickAddBtn').addEventListener('click',()=>open('#taskDialog'));
  $('#taskForm').addEventListener('submit',e=>{e.preventDefault();if(e.submitter?.value==='cancel'){e.currentTarget.closest('dialog').close();return}const f=new FormData(e.currentTarget);if(!f.get('title'))return;data.tasks.push({id:crypto.randomUUID(),title:f.get('title').trim(),category:f.get('category'),assignee:f.get('assignee'),date:f.get('date'),done:false});e.currentTarget.closest('dialog').close();render();toast('Task added to the schedule.');});
  $('#taskFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;$$('.filter-chip').forEach(x=>x.classList.toggle('selected',x===b));renderChores();});
  $('#scheduleList').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(!b)return;const t=data.tasks.find(x=>x.id===b.dataset.task);t.done=!t.done;render();toast(t.done?'Nice one. Task marked done.':'Task added back to your list.');});
  $('#addShoppingBtn').addEventListener('click',addShopping);$('#shoppingInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addShopping()}});
  function addShopping(){const input=$('#shoppingInput'),name=input.value.trim();if(!name){input.focus();return}data.shopping.unshift({id:crypto.randomUUID(),name,addedBy:'Jamie',bought:false});input.value='';render();toast('Added to the house list.');}
  $('#shoppingList').addEventListener('click',e=>{const check=e.target.closest('[data-shop-check]'),del=e.target.closest('[data-shop-delete]');if(check){const item=data.shopping.find(x=>x.id===check.dataset.shopCheck);item.bought=!item.bought;render();toast(item.bought?'Good find. Marked as picked up.':'Added back to the list.')}if(del){data.shopping=data.shopping.filter(x=>x.id!==del.dataset.shopDelete);render();toast('Removed from the list.')}});
  $('#clearBoughtBtn').addEventListener('click',()=>{const n=data.shopping.filter(x=>x.bought).length;data.shopping=data.shopping.filter(x=>!x.bought);render();toast(n?`Cleared ${n} picked up item${n===1?'':'s'}.`:'Nothing picked up to clear.');});
  $('#addExpenseBtn').addEventListener('click',()=>{ $('#shoppingForm').reset();$('#memberChecks input').forEach(x=>x.checked=true);open('#shoppingDialog'); });
  $('#shoppingForm').addEventListener('submit',e=>{e.preventDefault();if(e.submitter?.value==='cancel'){e.currentTarget.closest('dialog').close();return}const f=new FormData(e.currentTarget),split=$$('#memberChecks input:checked').map(x=>x.value),amount=Number(f.get('amount'));if(!split.length||!amount){toast('Choose at least one housemate and enter an amount.');return}data.expenses.push({id:crypto.randomUUID(),description:f.get('description').trim(),amount,payer:f.get('payer'),split,date:dateISO(0)});e.currentTarget.closest('dialog').close();render();toast('Expense shared with the house.');});
  $('#expenseFilter').addEventListener('change',renderExpenses);
  $('#inviteBtn').addEventListener('click',()=>open('#inviteDialog'));$('#inviteBtn2').addEventListener('click',()=>open('#inviteDialog'));
  $('#inviteForm').addEventListener('submit',e=>{e.preventDefault();if(e.submitter?.value==='cancel'){e.currentTarget.closest('dialog').close();return}const name=new FormData(e.currentTarget).get('name').trim();if(!name)return;data.members.push({id:crypto.randomUUID(),name,role:'Roommate',color:palette[data.members.length%palette.length]});e.currentTarget.closest('dialog').close();render();toast(`${name} is part of the household now.`);});
  $('#splitwiseBtn').addEventListener('click',()=>open('#splitwiseDialog'));
  const today=new Date();$('#todayLabel').textContent=today.toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
  const initialView=location.hash.slice(1);go(['chores','shopping','expenses'].includes(initialView)?initialView:'overview');render();
})();
