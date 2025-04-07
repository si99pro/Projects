"use strict";(self.webpackChunkmemories=self.webpackChunkmemories||[]).push([[658],{1244:(e,t,n)=>{n.d(t,{A:()=>u});var r=n(5043),o=n(8387),a=n(1807),i=n(8128),s=n(8301),l=n(4799),d=n(9857),c=n(6061);function h(e){return(0,c.Ay)("MuiCard",e)}(0,d.A)("MuiCard",["root"]);var p=n(579);const m=(0,i.Ay)(l.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})({overflow:"hidden"}),u=r.forwardRef((function(e,t){const n=(0,s.b)({props:e,name:"MuiCard"}),{className:r,raised:i=!1,...l}=n,d={...n,raised:i},c=(e=>{const{classes:t}=e;return(0,a.A)({root:["root"]},h,t)})(d);return(0,p.jsx)(m,{className:(0,o.A)(c.root,r),elevation:i?8:void 0,ref:t,ownerState:d,...l})}))},1658:(e,t,n)=>{n.r(t),n.d(t,{default:()=>B});var r=n(5043),o=n(9900),a=n(9806),i=n(5895),s=n(7873),l=n(1244),d=n(3969),c=n(2579),h=n(3089),p=n(6128),m=n(3849),u=n(298),x=n(5903),f=n(791),g=n(5472),v=n(4573),b=n(3241),A=n(9381),y=n(3435),w=n(579);const j=(0,x.A)(a.A)`
  padding-top: 40px;
  padding-bottom: 40px; // Keep bottom padding for spacing
`,k=(0,x.A)(i.A)`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 500;
`,C=(0,x.A)(s.A)`
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  margin-left: auto;
  margin-right: auto;
  font-size: 2rem;
  border: 2px solid #eee;
`,M=(0,x.A)(l.A)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer; // Make card look clickable
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
`,R=(0,x.A)(d.A)`
  position: absolute;
  top: 8px;   // Move closer to the corner
  right: 8px;  // Move closer to the corner
  background-color: ${e=>{let{theme:t}=e;return t.palette.primary.main}};
  color: white;
  border-radius: 50%;
  width: 30px;   // Make smaller
  height: 30px;  // Make smaller
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem; // Adjust font size for smaller badge
  font-weight: bold;
  z-index: 1;
`,S=(0,x.A)(d.A)`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
`,$=(0,x.A)(c.A)`
  padding: 6px;
  color: ${e=>{let{theme:t,disabled:n}=e;return n?t.palette.action.disabled:t.palette.text.secondary}};
  &:not([disabled]):hover {
     color: ${e=>{let{theme:t}=e;return t.palette.primary.main}};
  }
  & .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
`,N=()=>(0,w.jsx)(h.A,{item:!0,xs:12,sm:6,md:4,children:(0,w.jsx)(M,{children:(0,w.jsxs)(p.A,{sx:{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,w.jsx)(m.A,{variant:"circular",width:80,height:80,sx:{marginBottom:"15px"}}),(0,w.jsx)(m.A,{variant:"text",width:"70%",height:28,sx:{marginBottom:"5px"}})," ",(0,w.jsx)(m.A,{variant:"text",width:"50%",height:20,sx:{marginBottom:"2px"}})," ",(0,w.jsx)(m.A,{variant:"text",width:"60%",height:20,sx:{marginBottom:"15px"}})," ",(0,w.jsxs)(u.A,{direction:"row",spacing:1,justifyContent:"center",children:[(0,w.jsx)(m.A,{variant:"circular",width:28,height:28}),(0,w.jsx)(m.A,{variant:"circular",width:28,height:28}),(0,w.jsx)(m.A,{variant:"circular",width:28,height:28}),(0,w.jsx)(m.A,{variant:"circular",width:28,height:28})]})]})})});const B=function(){const[e,t]=(0,r.useState)([]),[n,a]=(0,r.useState)(!0),[s,l]=(0,r.useState)(null),d=(0,o.Zp)();(0,r.useEffect)((()=>{(async()=>{a(!0),l(null);try{const e=(await(0,g.GG)((0,g.rJ)(f.db,"users"))).docs.map((e=>({id:e.id,...e.data()})));t(e)}catch(e){console.error("Error fetching alumni:",e),l("Failed to load alumni data. Please check your connection and try again.")}finally{setTimeout((()=>a(!1)),500)}})()}),[]);const c=e=>{e.stopPropagation()};return(0,w.jsx)(w.Fragment,{children:(0,w.jsxs)(j,{maxWidth:"lg",children:[(0,w.jsx)(k,{variant:"h4",gutterBottom:!0,children:"Department Alumni"}),s&&(0,w.jsx)(i.A,{color:"error",align:"center",sx:{my:3},children:s}),(0,w.jsx)(h.A,{container:!0,spacing:4,children:n?Array.from(new Array(6)).map(((e,t)=>(0,w.jsx)(N,{},t))):e.map((e=>{var t,n;const r=null!==(t=null===e||void 0===e?void 0:e.basicInfo)&&void 0!==t?t:{},o=null!==(n=null===e||void 0===e?void 0:e.contactInfo)&&void 0!==n?n:{},a=(e=>{var t,n,r;return null!==(t=null===e||void 0===e||null===(n=e.workInfo)||void 0===n||null===(r=n.workExperience)||void 0===r?void 0:r[0])&&void 0!==t?t:{}})(e),s=r.fullName||"Alumnus Name",l=a.position||"Position Unavailable",m=a.company||"Company Unavailable",u=r.batch?r.batch.slice(-2):"??",x=r.profilebg||"#bdbdbd",f="Alumnus Name"!==s?s.charAt(0).toUpperCase():"?";return(0,w.jsx)(h.A,{item:!0,xs:12,sm:6,md:4,children:(0,w.jsxs)(M,{onClick:()=>{var t;(t=e.id)?d(`/users/${t}`):console.warn("Cannot navigate: User ID is missing.")},children:[(0,w.jsx)(R,{children:u}),(0,w.jsxs)(p.A,{children:[(0,w.jsx)(C,{style:{backgroundColor:x},src:r.profilePhotoURL,alt:s,children:!r.profilePhotoURL&&f}),(0,w.jsx)(i.A,{variant:"h6",component:"div",gutterBottom:!0,children:s}),a.position||a.company?(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(i.A,{variant:"body2",color:"text.secondary",sx:{minHeight:"1.43em"},children:l}),(0,w.jsx)(i.A,{variant:"body2",color:"text.secondary",sx:{minHeight:"1.43em"},children:m})]}):(0,w.jsx)(i.A,{variant:"body2",color:"text.disabled",sx:{minHeight:"2.86em",display:"flex",alignItems:"center",justifyContent:"center"},children:"Work Info Unavailable"}),(0,w.jsxs)(S,{children:[(0,w.jsx)($,{"aria-label":"email",href:r.email?`mailto:${r.email}`:void 0,disabled:!r.email,onClick:c,children:(0,w.jsx)(v.A,{})}),(0,w.jsx)($,{"aria-label":"phone",href:o.phoneNumber?`tel:${o.phoneNumber}`:void 0,disabled:!o.phoneNumber,onClick:c,children:(0,w.jsx)(b.A,{})}),(0,w.jsx)($,{"aria-label":"linkedin",href:o.linkedin?`https://www.linkedin.com/in/${o.linkedin}`:void 0,target:"_blank",rel:"noopener noreferrer",disabled:!o.linkedin,onClick:c,children:(0,w.jsx)(y.A,{})}),(0,w.jsx)($,{"aria-label":"facebook",href:o.facebook?`https://www.facebook.com/${o.facebook}`:void 0,target:"_blank",rel:"noopener noreferrer",disabled:!o.facebook,onClick:c,children:(0,w.jsx)(A.A,{})})]})]})]})},e.id)}))}),!n&&!s&&0===e.length&&(0,w.jsx)(i.A,{color:"text.secondary",align:"center",sx:{my:5},children:"No alumni data found."})]})})}},3241:(e,t,n)=>{n.d(t,{A:()=>a});var r=n(9992),o=n(579);const a=(0,r.A)((0,o.jsx)("path",{d:"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z"}),"Phone")},3849:(e,t,n)=>{n.d(t,{A:()=>w});var r=n(5043),o=n(8387),a=n(1807);function i(e){return String(e).match(/[\d.\-+]*\s*(.*)/)[1]||""}function s(e){return parseFloat(e)}var l=n(9826),d=n(3290),c=n(8128),h=n(1612),p=n(8301),m=n(9857),u=n(6061);function x(e){return(0,u.Ay)("MuiSkeleton",e)}(0,m.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var f=n(579);const g=d.i7`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,v=d.i7`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,b="string"!==typeof g?d.AH`
        animation: ${g} 2s ease-in-out 0.5s infinite;
      `:null,A="string"!==typeof v?d.AH`
        &::after {
          animation: ${v} 2s linear 0.5s infinite;
        }
      `:null,y=(0,c.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[n.variant],!1!==n.animation&&t[n.animation],n.hasChildren&&t.withChildren,n.hasChildren&&!n.width&&t.fitContent,n.hasChildren&&!n.height&&t.heightAuto]}})((0,h.A)((e=>{let{theme:t}=e;const n=i(t.shape.borderRadius)||"px",r=s(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:(0,l.X4)(t.palette.text.primary,"light"===t.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${n}/${Math.round(r/.6*10)/10}${n}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:e=>{let{ownerState:t}=e;return t.hasChildren},style:{"& > *":{visibility:"hidden"}}},{props:e=>{let{ownerState:t}=e;return t.hasChildren&&!t.width},style:{maxWidth:"fit-content"}},{props:e=>{let{ownerState:t}=e;return t.hasChildren&&!t.height},style:{height:"auto"}},{props:{animation:"pulse"},style:b||{animation:`${g} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(\n                90deg,\n                transparent,\n                ${(t.vars||t).palette.action.hover},\n                transparent\n              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:A||{"&::after":{animation:`${v} 2s linear 0.5s infinite`}}}]}}))),w=r.forwardRef((function(e,t){const n=(0,p.b)({props:e,name:"MuiSkeleton"}),{animation:r="pulse",className:i,component:s="span",height:l,style:d,variant:c="text",width:h,...m}=n,u={...n,animation:r,component:s,variant:c,hasChildren:Boolean(m.children)},g=(e=>{const{classes:t,variant:n,animation:r,hasChildren:o,width:i,height:s}=e,l={root:["root",n,r,o&&"withChildren",o&&!i&&"fitContent",o&&!s&&"heightAuto"]};return(0,a.A)(l,x,t)})(u);return(0,f.jsx)(y,{as:s,ref:t,className:(0,o.A)(g.root,i),ownerState:u,...m,style:{width:h,height:l,...d}})}))},4573:(e,t,n)=>{n.d(t,{A:()=>a});var r=n(9992),o=n(579);const a=(0,r.A)((0,o.jsx)("path",{d:"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"}),"Email")},6128:(e,t,n)=>{n.d(t,{A:()=>m});var r=n(5043),o=n(8387),a=n(1807),i=n(8128),s=n(8301),l=n(9857),d=n(6061);function c(e){return(0,d.Ay)("MuiCardContent",e)}(0,l.A)("MuiCardContent",["root"]);var h=n(579);const p=(0,i.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})({padding:16,"&:last-child":{paddingBottom:24}}),m=r.forwardRef((function(e,t){const n=(0,s.b)({props:e,name:"MuiCardContent"}),{className:r,component:i="div",...l}=n,d={...n,component:i},m=(e=>{const{classes:t}=e;return(0,a.A)({root:["root"]},c,t)})(d);return(0,h.jsx)(p,{as:i,className:(0,o.A)(m.root,r),ownerState:d,ref:t,...l})}))}}]);
//# sourceMappingURL=658.c255ae78.chunk.js.map