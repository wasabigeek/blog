"use strict";(self.webpackChunkwasabigeek=self.webpackChunkwasabigeek||[]).push([[678],{2105:function(e,t,n){n.r(t),n.d(t,{default:function(){return d}});var r=n(7294),a=n(1597),l=n(9519),o=n(8014),s=n(8771),i=n(8678),c=n(262),m=n(9175),u=function(e){var t=e.text,n=e.answers,a=e.correctAnswer,l=e.progressQuestion,o=(0,r.useState)(!1),s=o[0],i=o[1];return r.createElement("div",null,r.createElement("p",null,t),r.createElement("ul",null,n.map((function(e){return r.createElement("li",{style:s&&e===a?{color:"green",fontWeight:"bold"}:{}},e)}))),r.createElement("div",null,r.createElement("button",{style:{marginRight:10},onClick:function(){return i(!0)}},"Show Answer"),r.createElement("button",{onClick:function(){i(!1),l()}},"Next Question")))},h=[{text:"Which plant belongs to the same family as wasabi?",answers:["Carrot","Potato","Cabbage","Onion"],correctAnswer:"Cabbage"},{text:"How long does it take for wasabi to mature?",answers:["6 months","8 months","1 year","2 years"],correctAnswer:"2 years"},{text:"What is the main component of wasabi substitutes?",answers:["Mustard","Horseradish","Green Chilli","White Peppercorns"],correctAnswer:"Horseradish"},{text:"Which part of the wasabi plant is used to create the sushi condiment?",answers:["Stem","Root","Leaves","Fruit"],correctAnswer:"Stem"}],g=function(e){var t=e.questions,n=void 0===t?h:t,a=(0,r.useState)(Math.floor(Math.random()*n.length)),l=a[0],o=a[1];return r.createElement("section",{style:{marginBottom:(0,m.qZ)(2)}},r.createElement("h2",null,"Random Wasabi Question"),r.createElement(u,Object.assign({},n[l],{progressQuestion:function(){return o((l+1)%n.length)}})))},d=function(e){var t=e.data,n=e.location,u=t.site.siteMetadata.title,h=t.allMarkdownRemark.edges;return r.createElement(i.Z,{location:n,title:u},r.createElement(c.Z,{title:"All posts"}),r.createElement("section",{style:{marginBottom:(0,m.qZ)(2)}},r.createElement("h2",null,"From the Blog"),h.map((function(e){var t=e.node,n=t.frontmatter.title||t.fields.slug;return r.createElement("article",{key:t.fields.slug},r.createElement("header",null,r.createElement("h3",{style:{marginTop:(0,m.qZ)(1/4),marginBottom:(0,m.qZ)(1/4)}},r.createElement(a.Link,{style:{boxShadow:"none"},to:t.fields.slug},n)),r.createElement("small",null,t.frontmatter.date)),r.createElement("section",null,r.createElement("p",{dangerouslySetInnerHTML:{__html:t.frontmatter.description||t.excerpt}})))})),r.createElement(a.Link,{to:"/blog",style:{display:"block",marginTop:(0,m.qZ)(1.5)}},r.createElement(l.G,{icon:o.cLY,style:{marginRight:"0.5rem"},size:"xs"}),"more posts")),r.createElement(g,null),r.createElement(s.Z,null))}}}]);
//# sourceMappingURL=component---src-pages-index-js-cfb71342fc798cca05e9.js.map