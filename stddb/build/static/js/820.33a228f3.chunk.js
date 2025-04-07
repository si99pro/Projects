"use strict";(self.webpackChunkmemories=self.webpackChunkmemories||[]).push([[820],{1244:(e,t,r)=>{r.d(t,{A:()=>p});var i=r(5043),n=r(8387),o=r(1807),a=r(8128),s=r(8301),l=r(4799),d=r(9857),c=r(6061);function h(e){return(0,c.Ay)("MuiCard",e)}(0,d.A)("MuiCard",["root"]);var u=r(579);const x=(0,a.Ay)(l.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})({overflow:"hidden"}),p=i.forwardRef((function(e,t){const r=(0,s.b)({props:e,name:"MuiCard"}),{className:i,raised:a=!1,...l}=r,d={...r,raised:a},c=(e=>{const{classes:t}=e;return(0,o.A)({root:["root"]},h,t)})(d);return(0,u.jsx)(x,{className:(0,n.A)(c.root,i),elevation:a?8:void 0,ref:t,ownerState:d,...l})}))},1820:(e,t,r)=>{r.r(t),r.d(t,{default:()=>K});var i=r(5043),n=r(791),o=r(5472),a=r(5903),s=r(9806),l=r(4799),d=r(1244),c=r(6128),h=r(5895),u=r(3969),x=r(2097),p=r(7873),f=r(2579),m=r(3849),g=r(3089),b=r(1202),v=r(6803),A=r(7211),j=r(6592),y=r(9067),w=r(4938),C=r(7471),k=r(1773),S=r(9992),R=r(579);const M=(0,S.A)((0,R.jsx)("path",{d:"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"}),"ErrorOutline"),I=(0,i.lazy)((()=>Promise.all([r.e(893),r.e(346)]).then(r.bind(r,6346)))),N="#3f51b5",$=(0,a.A)(s.A)`
    margin-top: 20px;
    margin-bottom: 40px;
    /* Removed fixed padding-left/right - let MainLayout handle overall padding */
    color: ${"#212121"};
    font-family: 'Roboto', sans-serif;
    /* Optional: Remove if MainLayout bg is sufficient */
    /* background-color: ${"#ffffff"}; */
    display: block;
`,z=(0,a.A)(l.A)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }
`,P=(0,a.A)(z)`
    padding: 24px;
`,W=(0,a.A)(z)`
    padding: 18px 24px;
`,G=(0,a.A)(d.A)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    height: 100%; // Important for Grid layout
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    &:hover {
       transform: translateY(-4px);
       box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
    width: 100%; // Ensure it takes full width of its Grid item
    box-sizing: border-box;
`,U=(0,a.A)(c.A)`
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
    background-color: #fafafa; // Slightly off-white header
    flex-shrink: 0;
`,E=(0,a.A)(c.A)((e=>{let{theme:t}=e;return{paddingLeft:t.spacing(2.5),paddingRight:t.spacing(2.5),paddingTop:t.spacing(2.5),paddingBottom:t.spacing(2.5),flexGrow:1,"&:last-child":{paddingBottom:t.spacing(2.5)},overflowY:"auto",minHeight:0}})),O=(0,a.A)(h.A)`
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${N};
`,B=(0,a.A)(u.A)`
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px; // Space for scrollbar
    margin-left: -8px; // Compensate for button margin
    margin-right: -8px; // Compensate for button margin
    // Custom scrollbar styles
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: #aaa; }
    scrollbar-width: thin; // Firefox
    scrollbar-color: #ccc transparent; // Firefox
`,D=(0,a.A)(x.A)`
    margin: 0 8px; // Space between buttons
    text-transform: none; // Keep original casing
    border-radius: 16px; // Pill shape
    font-weight: 500;
`,F=(0,a.A)(p.A)`
    width: 80px;
    height: 80px;
    margin-right: 24px;
    position: relative; // Needed for positioning the edit icon
    background-color: ${e=>e.profilebg||N}; // Dynamic background
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    flex-shrink: 0; // Prevent shrinking in flex layout
    overflow: visible; // Allow absolutely positioned children (edit icon) to overflow
`,H=(0,a.A)(u.A)`
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
`,L=(0,a.A)(f.A)`
    position: absolute;
    bottom: 0px;
    right: 0px;
    background-color: rgba(255, 255, 255, 0.95); // Semi-transparent white background
    padding: 5px;
    border: 1px solid rgba(0,0,0,0.1); // Subtle border
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    z-index: 1; // Ensure it's on top of the avatar
    &:hover {
        background-color: white;
        transform: scale(1.15); // Slight zoom on hover
    }
    svg { // Style the icon itself
        font-size: 16px;
        color: ${N};
    }
`,X=(0,a.A)(u.A)`
    display: flex;
    flex-direction: column;
    gap: 4px; // Space between text lines
    flex-grow: 1; // Take remaining horizontal space
    min-width: 0; // Prevent overflow issues in flex layouts
`,T={position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:{xs:"90%",sm:400},bgcolor:"background.paper",border:"none",borderRadius:"12px",boxShadow:24,p:4},Y=()=>(0,R.jsxs)(u.A,{children:[(0,R.jsx)(m.A,{variant:"text",height:30,width:"80%",sx:{mb:1}}),(0,R.jsx)(m.A,{variant:"rectangular",height:60,sx:{mb:2}}),(0,R.jsx)(m.A,{variant:"text",height:30,width:"70%",sx:{mb:1}}),(0,R.jsx)(m.A,{variant:"rectangular",height:60,sx:{mb:2}}),(0,R.jsx)(m.A,{variant:"text",height:20,width:"90%"})]});const K=function(){const[e,t]=(0,i.useState)(null),[r,a]=(0,i.useState)(!0),[s,l]=(0,i.useState)(null),[d,c]=(0,i.useState)(!1),[p,f]=(0,i.useState)(""),[S,z]=(0,i.useState)(!1);(0,i.useEffect)((()=>{let e=!0;a(!0),l(null);const r=n.j.currentUser;if(r)return async function(){try{const a=(0,o.H9)(n.db,"users",r.uid),s=await(0,o.x7)(a);if(e)if(s.exists()){var i;const e=s.data();t(e),f((null===(i=e.basicInfo)||void 0===i?void 0:i.currentStatus)||"")}else console.warn("No user document found for UID:",r.uid),t({}),l("Welcome! Please complete your profile information.")}catch(s){console.error("Error fetching user data:",s),e&&l("Failed to load dashboard data. Please check connection.")}finally{e&&a(!1)}}(),()=>{e=!1};e&&(l("User not authenticated. Please log in."),a(!1))}),[]);const K=()=>c(!1),Q=()=>{var t;f((null===e||void 0===e||null===(t=e.basicInfo)||void 0===t?void 0:t.currentStatus)||""),c(!0)},Z=()=>z(!1),q=()=>z(!0),J=(null===e||void 0===e?void 0:e.basicInfo)||{},V=e&&0===Object.keys(J).length&&!(null!==s&&void 0!==s&&s.includes("Failed"));return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)($,{children:[" ",!r&&s&&(0,R.jsx)(v.A,{severity:V?"info":"error",icon:V?(0,R.jsx)(k.A,{fontSize:"inherit"}):(0,R.jsx)(M,{fontSize:"inherit"}),sx:{mb:3},children:s}),r&&(0,R.jsxs)(g.A,{container:!0,spacing:3,sx:{display:"flex",flexWrap:"wrap",width:"100%"},children:[(0,R.jsx)(g.A,{item:!0,xs:12,md:8,sx:{display:"flex",flexDirection:"column"},children:(0,R.jsxs)(u.A,{sx:{display:"flex",flexDirection:"column",gap:3,flexGrow:1},children:[(0,R.jsx)(P,{children:(0,R.jsxs)(H,{children:[(0,R.jsx)(m.A,{variant:"circular",width:80,height:80,sx:{mr:"24px",flexShrink:0,overflow:"visible"}}),(0,R.jsxs)(X,{sx:{flexGrow:1,minWidth:0},children:[(0,R.jsx)(m.A,{height:40,width:"60%",sx:{mb:1}}),(0,R.jsx)(m.A,{height:20,width:"80%"}),(0,R.jsx)(m.A,{height:20,width:"90%"})]})]})}),(0,R.jsxs)(W,{children:[(0,R.jsx)(m.A,{height:30,width:120,sx:{mb:2}}),(0,R.jsxs)(B,{children:[(0,R.jsx)(m.A,{variant:"rounded",width:140,height:36,sx:{m:"0 8px",display:"inline-block",borderRadius:"16px"}}),(0,R.jsx)(m.A,{variant:"rounded",width:120,height:36,sx:{m:"0 8px",display:"inline-block",borderRadius:"16px"}}),(0,R.jsx)(m.A,{variant:"rounded",width:90,height:36,sx:{m:"0 8px",display:"inline-block",borderRadius:"16px"}}),(0,R.jsx)(m.A,{variant:"rounded",width:160,height:36,sx:{m:"0 8px",display:"inline-block",borderRadius:"16px"}})]})]})]})}),(0,R.jsx)(g.A,{item:!0,xs:12,md:4,sx:{display:"flex"},children:(0,R.jsxs)(G,{sx:{flexGrow:1},children:[(0,R.jsx)(U,{children:(0,R.jsx)(m.A,{height:30,width:"60%"})}),(0,R.jsxs)(E,{children:[(0,R.jsx)(Y,{})," "]})]})})]}),!r&&e&&(()=>{var e;return(0,R.jsxs)(g.A,{container:!0,spacing:3,sx:{display:"flex",flexWrap:"wrap",width:"100%"},children:[(0,R.jsxs)(g.A,{item:!0,xs:12,md:8,sx:{display:"flex",flexDirection:"column"},children:[(0,R.jsxs)(u.A,{sx:{display:"flex",flexDirection:"column",gap:3,flexGrow:1},children:[V?(0,R.jsx)(P,{children:(0,R.jsxs)(H,{children:[(0,R.jsxs)(F,{onClick:q,"aria-label":"Complete your profile",children:[(0,R.jsx)(L,{size:"small","aria-label":"Open edit profile modal",onClick:e=>{e.stopPropagation(),q()},children:(0,R.jsx)(k.A,{})}),"? "]}),(0,R.jsxs)(X,{children:[(0,R.jsx)(h.A,{variant:"h5",component:"h1",gutterBottom:!0,children:"Welcome!"}),(0,R.jsx)(h.A,{variant:"body1",color:"textSecondary",children:"Click the avatar to get started."})]})]})}):(0,R.jsx)(P,{children:(0,R.jsxs)(H,{children:[(0,R.jsxs)(F,{profilebg:J.profilebg||N,onClick:q,"aria-label":`Edit profile for ${J.fullName||"User"}`,children:[(0,R.jsx)(L,{size:"small","aria-label":"Open edit profile modal",onClick:e=>{e.stopPropagation(),q()},children:(0,R.jsx)(k.A,{})}),(null===(e=J.fullName)||void 0===e?void 0:e.charAt(0).toUpperCase())||"?"]}),(0,R.jsxs)(X,{children:[(0,R.jsxs)(h.A,{variant:"h5",component:"h1",fontWeight:600,children:["Welcome, ",J.fullName||"User","!"]}),(0,R.jsx)(h.A,{variant:"body1",color:"textSecondary",sx:{mb:.5,overflowWrap:"break-word"},children:J.email||"No email found"}),(0,R.jsxs)(h.A,{variant:"body2",color:"textSecondary",children:[(0,R.jsx)("strong",{children:"ID:"})," ",J.studentId||"N/A"," | ",(0,R.jsx)("strong",{children:"Session:"})," ",J.session||"N/A"]}),J.currentStatus&&(0,R.jsxs)(h.A,{variant:"caption",color:"text.secondary",sx:{fontStyle:"italic",mt:.5},children:["Status: ",J.currentStatus]})]})]})}),(0,R.jsxs)(W,{children:[(0,R.jsx)(O,{variant:"h6",children:"Quick Links"}),(0,R.jsxs)(B,{children:[(0,R.jsx)(D,{variant:"outlined",color:"primary",component:b.A,href:"#",children:"Course Catalog"}),(0,R.jsx)(D,{variant:"outlined",color:"primary",component:b.A,href:"#",children:"Assignments"}),(0,R.jsx)(D,{variant:"outlined",color:"primary",component:b.A,href:"#",children:"Grades"}),(0,R.jsx)(D,{variant:"outlined",color:"primary",component:b.A,href:"#",children:"Campus Map"}),(0,R.jsx)(D,{variant:"contained",color:"secondary",onClick:Q,sx:{borderRadius:"16px"},children:"Update Status"})]})]})]})," "]})," ",(0,R.jsx)(g.A,{item:!0,xs:12,md:4,sx:{display:"flex"},children:(0,R.jsxs)(G,{sx:{flexGrow:1},children:[(0,R.jsx)(U,{children:(0,R.jsx)(h.A,{variant:"h6",component:"div",fontWeight:500,children:"Latest Discussions"})}),(0,R.jsx)(E,{children:(0,R.jsx)(i.Suspense,{fallback:(0,R.jsx)(Y,{}),children:(0,R.jsx)(I,{})})})]})})," "]})})(),!r&&!e&&!s&&(0,R.jsx)(v.A,{severity:"warning",sx:{mt:3},children:"Could not retrieve user session. Please try logging in again."})]}),(0,R.jsx)(A.A,{open:S,onClose:Z,"aria-labelledby":"edit-profile-modal-title",children:(0,R.jsxs)(u.A,{sx:T,children:[(0,R.jsx)(h.A,{id:"edit-profile-modal-title",variant:"h6",component:"h2",gutterBottom:!0,children:"Edit Profile"}),(0,R.jsx)(h.A,{sx:{mt:2},children:"Profile editing functionality (e.g., picture upload) will be implemented here."}),(0,R.jsxs)(u.A,{sx:{display:"flex",justifyContent:"flex-end",gap:1,mt:3},children:[(0,R.jsx)(x.A,{onClick:Z,children:"Cancel"}),(0,R.jsx)(x.A,{variant:"contained",color:"primary",disabled:!0,children:"Save Changes"})," "]})]})}),(0,R.jsx)(A.A,{open:d,onClose:K,"aria-labelledby":"current-status-modal-title",children:(0,R.jsxs)(u.A,{sx:T,children:[(0,R.jsx)(h.A,{id:"current-status-modal-title",variant:"h6",component:"h2",gutterBottom:!0,children:"Update Current Status"}),(0,R.jsxs)(j.A,{fullWidth:!0,margin:"normal",children:[(0,R.jsx)(y.A,{id:"current-status-label",children:"Current Status"}),(0,R.jsxs)(w.A,{labelId:"current-status-label",value:p,label:"Current Status",onChange:e=>f(e.target.value),children:[(0,R.jsx)(C.A,{value:"",children:(0,R.jsx)("em",{children:"None"})}),(0,R.jsx)(C.A,{value:"Studying",children:"Studying"}),(0,R.jsx)(C.A,{value:"Graduated",children:"Graduated"}),(0,R.jsx)(C.A,{value:"Employed",children:"Employed"}),(0,R.jsx)(C.A,{value:"Seeking Opportunity",children:"Seeking Opportunity"}),(0,R.jsx)(C.A,{value:"Overseas",children:"Overseas"}),(0,R.jsx)(C.A,{value:"Unemployed",children:"Unemployed"})]})]}),(0,R.jsxs)(u.A,{sx:{display:"flex",justifyContent:"flex-end",gap:1,mt:3},children:[(0,R.jsx)(x.A,{onClick:K,children:"Cancel"}),(0,R.jsx)(x.A,{variant:"contained",color:"primary",onClick:async()=>{var r;const i=n.j.currentUser;if(!i)return void l("Authentication error. Please log in again.");const a=(null===e||void 0===e||null===(r=e.basicInfo)||void 0===r?void 0:r.currentStatus)||"";try{c(!1),t((e=>({...e,basicInfo:{...(null===e||void 0===e?void 0:e.basicInfo)||{},currentStatus:p}})));const e=(0,o.H9)(n.db,"users",i.uid);await(0,o.mZ)(e,{"basicInfo.currentStatus":p}),console.log("Status updated successfully")}catch(s){console.error("Error updating current status:",s),l("Failed to update status. Please try again."),t((e=>({...e,basicInfo:{...(null===e||void 0===e?void 0:e.basicInfo)||{},currentStatus:a}})))}},children:"Submit"})]})]})})]})}},3849:(e,t,r)=>{r.d(t,{A:()=>y});var i=r(5043),n=r(8387),o=r(1807);function a(e){return String(e).match(/[\d.\-+]*\s*(.*)/)[1]||""}function s(e){return parseFloat(e)}var l=r(9826),d=r(3290),c=r(8128),h=r(1612),u=r(8301),x=r(9857),p=r(6061);function f(e){return(0,p.Ay)("MuiSkeleton",e)}(0,x.A)("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var m=r(579);const g=d.i7`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,b=d.i7`
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
`,v="string"!==typeof g?d.AH`
        animation: ${g} 2s ease-in-out 0.5s infinite;
      `:null,A="string"!==typeof b?d.AH`
        &::after {
          animation: ${b} 2s linear 0.5s infinite;
        }
      `:null,j=(0,c.Ay)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:r}=e;return[t.root,t[r.variant],!1!==r.animation&&t[r.animation],r.hasChildren&&t.withChildren,r.hasChildren&&!r.width&&t.fitContent,r.hasChildren&&!r.height&&t.heightAuto]}})((0,h.A)((e=>{let{theme:t}=e;const r=a(t.shape.borderRadius)||"px",i=s(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:(0,l.X4)(t.palette.text.primary,"light"===t.palette.mode?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${i}${r}/${Math.round(i/.6*10)/10}${r}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:e=>{let{ownerState:t}=e;return t.hasChildren},style:{"& > *":{visibility:"hidden"}}},{props:e=>{let{ownerState:t}=e;return t.hasChildren&&!t.width},style:{maxWidth:"fit-content"}},{props:e=>{let{ownerState:t}=e;return t.hasChildren&&!t.height},style:{height:"auto"}},{props:{animation:"pulse"},style:v||{animation:`${g} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(\n                90deg,\n                transparent,\n                ${(t.vars||t).palette.action.hover},\n                transparent\n              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:A||{"&::after":{animation:`${b} 2s linear 0.5s infinite`}}}]}}))),y=i.forwardRef((function(e,t){const r=(0,u.b)({props:e,name:"MuiSkeleton"}),{animation:i="pulse",className:a,component:s="span",height:l,style:d,variant:c="text",width:h,...x}=r,p={...r,animation:i,component:s,variant:c,hasChildren:Boolean(x.children)},g=(e=>{const{classes:t,variant:r,animation:i,hasChildren:n,width:a,height:s}=e,l={root:["root",r,i,n&&"withChildren",n&&!a&&"fitContent",n&&!s&&"heightAuto"]};return(0,o.A)(l,f,t)})(p);return(0,m.jsx)(j,{as:s,ref:t,className:(0,n.A)(g.root,a),ownerState:p,...x,style:{width:h,height:l,...d}})}))},6128:(e,t,r)=>{r.d(t,{A:()=>x});var i=r(5043),n=r(8387),o=r(1807),a=r(8128),s=r(8301),l=r(9857),d=r(6061);function c(e){return(0,d.Ay)("MuiCardContent",e)}(0,l.A)("MuiCardContent",["root"]);var h=r(579);const u=(0,a.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})({padding:16,"&:last-child":{paddingBottom:24}}),x=i.forwardRef((function(e,t){const r=(0,s.b)({props:e,name:"MuiCardContent"}),{className:i,component:a="div",...l}=r,d={...r,component:a},x=(e=>{const{classes:t}=e;return(0,o.A)({root:["root"]},c,t)})(d);return(0,h.jsx)(u,{as:a,className:(0,n.A)(x.root,i),ownerState:d,ref:t,...l})}))}}]);
//# sourceMappingURL=820.33a228f3.chunk.js.map