"use strict";(self.webpackChunkmemories=self.webpackChunkmemories||[]).push([[460],{7460:(e,t,r)=>{r.r(t),r.d(t,{default:()=>R});var n,o=r(5043),a=r(9806),i=r(2097),s=r(5895),u=r(6803),d=r(4343),c=r(5903),l=r(9900),m=r(791),p=r(5472),f=new Uint8Array(16);function g(){if(!n&&!(n="undefined"!==typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!==typeof msCrypto&&"function"===typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return n(f)}const h=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;const x=function(e){return"string"===typeof e&&h.test(e)};for(var y=[],v=0;v<256;++v)y.push((v+256).toString(16).substr(1));const b=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=(y[e[t+0]]+y[e[t+1]]+y[e[t+2]]+y[e[t+3]]+"-"+y[e[t+4]]+y[e[t+5]]+"-"+y[e[t+6]]+y[e[t+7]]+"-"+y[e[t+8]]+y[e[t+9]]+"-"+y[e[t+10]]+y[e[t+11]]+y[e[t+12]]+y[e[t+13]]+y[e[t+14]]+y[e[t+15]]).toLowerCase();if(!x(r))throw TypeError("Stringified UUID is invalid");return r};const w=function(e,t,r){var n=(e=e||{}).random||(e.rng||g)();if(n[6]=15&n[6]|64,n[8]=63&n[8]|128,t){r=r||0;for(var o=0;o<16;++o)t[r+o]=n[o];return t}return b(n)};var j=r(8957),A=r(579);const C=(0,c.A)(a.A)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* Adjusted for smaller height */
  padding: 20px;
`,S=c.A.form`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
`,k=(0,c.A)(i.A)`
  margin-top: 16px;
`;const R=function(){const[e,t]=(0,o.useState)(""),[r,n]=(0,o.useState)(""),[a,i]=(0,o.useState)(""),c=(0,l.Zp)();return(0,A.jsxs)(A.Fragment,{children:["  ",(0,A.jsx)(j.A,{})," ",(0,A.jsxs)(C,{maxWidth:"sm",children:[(0,A.jsx)(s.A,{variant:"h5",align:"center",gutterBottom:!0,children:"Create New Moment"}),a&&(0,A.jsx)(u.A,{severity:"error",children:a}),(0,A.jsxs)(S,{onSubmit:async t=>{t.preventDefault(),i("");try{const t=m.j.currentUser;if(!t)return void i("You must be logged in to create a moment.");const n={id:w(),title:e,description:r,createdAt:new Date},o=(0,p.H9)(m.db,"users",t.uid);await(0,p.mZ)(o,{moments:(0,p.hq)(n)}),console.log("Moment saved successfully!"),c("/dashboard")}catch(n){console.error("Error saving moment:",n),i(n.message)}},children:[(0,A.jsx)(d.A,{label:"Title",value:e,onChange:e=>t(e.target.value),required:!0,fullWidth:!0}),(0,A.jsx)(d.A,{label:"Description",multiline:!0,rows:4,value:r,onChange:e=>n(e.target.value),required:!0,fullWidth:!0}),(0,A.jsx)(k,{variant:"contained",color:"primary",type:"submit",children:"Share Moment"})]})]})]})}}}]);
//# sourceMappingURL=460.782da4c0.chunk.js.map