(this.webpackJsonpaddin=this.webpackJsonpaddin||[]).push([[0],{14:function(e,t,n){},15:function(e,t,n){},21:function(e,t,n){"use strict";n.r(t);var r=n(1),c=n.n(r),o=n(7),i=n.n(o),l=(n(14),n(9)),a=n(2),s=(n(15),n(8)),d=n.n(s),u=n(0),b=function(e){var t=e.name,n=e.setName;return Object(u.jsxs)("div",{style:{backgroundSize:"cover",backgroundImage:"url(https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg)"},className:"h-32 w-full  flex justify-center relative",children:[Object(u.jsx)(d.a,{html:t,onChange:function(e){return n(e.target.value)},className:"bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl outline-none"}),Object(u.jsx)("img",{src:"/images/bilogo.png",alt:"Bringit",className:"absolute top-3 left-2 w-12 filter border-white border-2 rounded-full"}),Object(u.jsx)("img",{src:"/images/pfpic.png",alt:"Profile",className:"absolute top-3 left-16 w-12"})]})},f=function(e){var t=e.onAdd;return Object(u.jsx)("div",{onClick:t,className:"rounded-xl h-20 flex items-center justify-center bg-gray-200 hover:bg-blue-500 transition-colors duration-300 cursor-pointer",style:{width:"40vw"},children:Object(u.jsx)("span",{className:"bg-white rounded-md h-14 flex justify-center items-center text-2xl ",style:{width:"calc(100% - 1.5rem)"},children:"New Section"})})},j=n(5),m=function(e){var t=e.title,n=e.color,c=e.onEdit,o=e.onDelete,i=e.onColorChange,l=Object(r.useState)(!1),s=Object(a.a)(l,2),d=s[0],b=s[1];return Object(u.jsxs)("span",{className:"flex justify-between items-center w-full text-2xl font-bold text-left mb-2",children:[Object(u.jsxs)("div",{className:"relative",children:[Object(u.jsx)("div",{onClick:function(){return b(!d)},className:"border-"+n+"-500 bg-"+n+"-500 border-2 box-border h-3 w-3 p-2 rounded-full mr-4"}),Object(u.jsx)("div",{className:"absolute flex flex-row flex-wrap justify-around items-center border-2 border-black rounded-lg mt-3 bg-gray-50 p-1 shadow-xl bg-opacity-80",style:{display:d?"flex":"none",width:"10rem",height:"5rem"},children:["red","pink","yellow","green","blue","indigo","purple","gray"].map((function(e){return Object(u.jsx)("div",{onClick:function(){return function(e){b(!1),i(e)}(e)},className:"border-"+e+"-500 bg-"+e+"-500 border-2 box-border h-3 w-3 p-2 rounded-full mx-2"},e)}))})]}),Object(u.jsx)("input",{type:"text",value:t,onChange:function(e){return c(e.target.value)},className:"outline-none text-"+n+"-500"}),Object(u.jsx)(j.a,{onClick:o,style:{color:"red",cursor:"pointer"},className:"text-xl"})]})},x=function(e){var t=e.color,n=e.focus,r=e.id,c=e.text,o=e.checked,i=e.onEdit,l=e.onDelete,a=e.addItem;return Object(u.jsxs)("li",{className:"bg-white mb-4",children:[Object(u.jsx)("input",{type:"checkbox",checked:o,onChange:function(e){return i(r,c,e.currentTarget.checked)},className:"border-2 border-"+t+"-400 rounded-full",style:{backgroundColor:o?{red:"rgb(248, 113, 113)",blue:"rgb(96, 165, 250)",yellow:"rgb(251, 191, 36)",green:"rgb(52, 211, 153)",gray:"rgb(156, 163, 175)",indigo:"rgb(129, 140, 248)",purple:"rgb(167, 139, 250)",pink:"rgb(244, 114, 182)"}[t]:""}}),Object(u.jsx)("input",{type:"text",autoFocus:n,value:c,onChange:function(e){return i(r,e.target.value,o)},onKeyDown:function(e){"Enter"===e.key&&a()},className:"outline-none w-full border-0 ml-4 flex flex-wrap"}),Object(u.jsx)(j.a,{className:"text-red-500 cursor-pointer",onClick:function(){return l(r)}})]})},g=function(e){var t=e.card,n=e.onEdit,c=e.onDelete,o=Object.assign({},t),i=Object(r.useState)(-1),l=Object(a.a)(i,2),s=l[0],d=l[1],b=function(e){void 0===e&&(e=o.items.length);var t={id:Math.floor(1e5*Math.random()),text:"",checked:!1};o.items.splice(e+1,0,t),d(e+1),n(o)},f=function(e,t,r){o.items=o.items.map((function(n){return n.id===e?{id:e,text:t,checked:r}:n})),n(o)},j=function(e){o.items=o.items.filter((function(t){return t.id!==e})),n(o)};return Object(u.jsxs)("div",{className:"pack-list-card mb-8",children:[Object(u.jsx)(m,{title:o.name,color:o.color,onEdit:function(e){o.name=e,n(o)},onDelete:function(){return c(o.id)},onColorChange:function(e){o.color=e,n(o)}}),Object(u.jsx)("div",{children:Object(u.jsxs)("ul",{className:"pack-list blue",children:[t.items.map((function(e,t){return Object(u.jsx)(x,{focus:t===s,id:e.id,color:o.color,text:e.text,checked:e.checked,onEdit:f,onDelete:j,addItem:function(){return b(t)}},e.id)})),Object(u.jsx)("li",{onClick:b,className:"add bg-white hover:bg-"+t.color+"-400 transition-colors cursor-pointer mb-0",children:"Add Item"})]})})]})};var h=function(){var e=Object(r.useState)([]),t=Object(a.a)(e,2),n=t[0],c=t[1],o=Object(r.useState)("Name"),i=Object(a.a)(o,2),s=i[0],d=i[1],j=function(){return Math.floor(1e5*Math.random())},m=function(e){c(n.map((function(t){return t.id===e.id?e:t})))},x=function(e){c(n.filter((function(t){return t.id!==e})))};return Object(u.jsxs)(u.Fragment,{children:[Object(u.jsx)(b,{name:s,setName:d}),Object(u.jsxs)("div",{className:"flex flex-wrap justify-around p-4",children:[n.map((function(e){return Object(u.jsx)(g,{card:e,onEdit:m,onDelete:x},e.id)})),Object(u.jsx)(f,{onAdd:function(){var e=j(),t=j(),r=["red","blue","yellow","green","gray","indigo","purple","pink"][Math.floor(8*Math.random())];c([].concat(Object(l.a)(n),[{id:e,name:"New Section",color:r,items:[{id:t,text:"",checked:!1}]}]))}})]})]})},p=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,22)).then((function(t){var n=t.getCLS,r=t.getFID,c=t.getFCP,o=t.getLCP,i=t.getTTFB;n(e),r(e),c(e),o(e),i(e)}))};i.a.render(Object(u.jsx)(c.a.StrictMode,{children:Object(u.jsx)(h,{})}),document.getElementById("root")),p()}},[[21,1,2]]]);
//# sourceMappingURL=main.22e8b60b.chunk.js.map