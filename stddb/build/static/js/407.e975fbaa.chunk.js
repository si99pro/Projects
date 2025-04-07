"use strict";(self.webpackChunkmemories=self.webpackChunkmemories||[]).push([[407],{6407:(e,t,s)=>{s.r(t),s.d(t,{default:()=>C});var r=s(5043),a=s(791),n=s(1729),i=s(5472),l=s(9900),o=s(9806),u=s(2097),h=s(3969),d=s(7471),c=s(5895),g=s(6803),m=s(4343),x=s(6592),p=s(9067),b=s(4938),f=s(5903),v=s(579);const A=(0,f.A)(o.A)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`,j=f.A.form`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`,S=(0,f.A)(u.A)`
  margin-top: 20px;
  width: 100%;
`,y=(0,f.A)(l.N_)`
  margin-top: 16px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: #1976d2;

  &:hover {
    text-decoration: underline;
  }
`,W=(0,f.A)(h.A)`
  min-height: 53px;
  margin-bottom: 8px;
`,w=(0,f.A)(h.A)`
  display: flex;
  gap: 20px;

  & > div {
    width: 100%;
  }
`;const C=function(){const[e,t]=(0,r.useState)(""),[s,o]=(0,r.useState)(""),[u,h]=(0,r.useState)(""),[f,C]=(0,r.useState)(""),[I,k]=(0,r.useState)(""),[D,q]=(0,r.useState)(""),[N,M]=(0,r.useState)(""),$=(0,l.Zp)(),B=e=>7===e.length&&e.startsWith("16")?"2016":7===e.length&&e.startsWith("17")?"2017":7===e.length&&e.startsWith("18")?"2018":7===e.length&&e.startsWith("19")?"2019":7===e.length&&e.startsWith("20")?"2020":7===e.length&&e.startsWith("21")?"2021":7===e.length&&e.startsWith("22")?"2022":7===e.length&&e.startsWith("23")?"2023":7===e.length&&e.startsWith("24")?"2024":7===e.length&&e.startsWith("25")?"2025":null;return(0,v.jsxs)(A,{maxWidth:"sm",children:[(0,v.jsx)(c.A,{variant:"h4",align:"center",gutterBottom:!0,children:"Create Account"}),(0,v.jsxs)(W,{children:[D&&(0,v.jsx)(g.A,{severity:"error",children:D}),N&&(0,v.jsx)(g.A,{severity:"success",children:N})]}),(0,v.jsxs)(j,{onSubmit:async t=>{if(t.preventDefault(),q(""),M(""),7!==u.length)return void q("Student ID must be 7 digits.");const r=B(u);if(!r)return void q("Could not determine batch from Student ID. ID must start with 16, 17, 18, 19, 20, 21, 22, 23, 24 or 25");if(parseInt(u.substring(0,2))>parseInt(f.substring(0,4)).toString().substring(2,4))q("Make sure that you have typed correct ID and Session.");else try{const t=(await(0,n.eJ)(a.j,s,I)).user;await(0,n.gA)(t);const l=`#${Math.floor(16777215*Math.random()).toString(16)}`,o={basicInfo:{fullName:e,email:s,studentId:u,batch:r,session:f,profilebg:l,emailStatus:!1},roles:["user"]};await(0,i.BN)((0,i.H9)(a.db,"users",t.uid),o),M("Check your inbox to verify your email address."),$("/login")}catch(l){console.error(l),q(l.message)}},children:[(0,v.jsx)(m.A,{label:"Full Name",value:e,onChange:e=>t(e.target.value),fullWidth:!0,margin:"normal",required:!0}),(0,v.jsx)(m.A,{label:"Email",type:"email",value:s,onChange:e=>o(e.target.value),fullWidth:!0,margin:"normal",required:!0}),(0,v.jsxs)(w,{children:[(0,v.jsx)(m.A,{label:"Student ID",value:u,onChange:e=>h(e.target.value),fullWidth:!0,margin:"normal",required:!0}),(0,v.jsxs)(x.A,{fullWidth:!0,margin:"normal",required:!0,children:[(0,v.jsx)(p.A,{id:"session-label",children:"Session"}),(0,v.jsxs)(b.A,{labelId:"session-label",id:"session",value:f,onChange:e=>C(e.target.value),label:"Session",children:[(0,v.jsx)(d.A,{value:"",children:"Session"}),(()=>{const e=(new Date).getFullYear(),t=[];for(let s=2016;s<=e;s++){const e=`${s} - ${s+3}`;t.push((0,v.jsx)(d.A,{value:e,children:e},s))}return t})()]})]})]}),(0,v.jsx)(m.A,{label:"Password",type:"password",value:I,onChange:e=>k(e.target.value),fullWidth:!0,margin:"normal",required:!0}),(0,v.jsx)(S,{variant:"contained",color:"primary",type:"submit",children:"Sign Up"}),(0,v.jsx)(y,{to:"/login",children:"Already have an account? Login"})]})]})}}}]);
//# sourceMappingURL=407.e975fbaa.chunk.js.map