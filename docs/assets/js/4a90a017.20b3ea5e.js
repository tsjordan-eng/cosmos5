"use strict";(self.webpackChunknewdocs_openc_3_com=self.webpackChunknewdocs_openc_3_com||[]).push([[7647],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>h});var o=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=o.createContext({}),c=function(e){var t=o.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=c(e.components);return o.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(n),m=r,h=d["".concat(l,".").concat(m)]||d[m]||u[m]||a;return n?o.createElement(h,i(i({ref:t},s),{},{components:n})):o.createElement(h,i({ref:t},s))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=m;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p[d]="string"==typeof e?e:r,i[1]=p;for(var c=2;c<a;c++)i[c]=n[c];return o.createElement.apply(null,i)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7548:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>p,toc:()=>c});var o=n(7462),r=(n(7294),n(3905));const a={title:"Developing COSMOS"},i="Developing COSMOS",p={unversionedId:"development/developing",id:"development/developing",title:"Developing COSMOS",description:"So you want to help develop COSMOS? All of our open source COSMOS code is on Github so the first thing to do is get an account. Next clone the COSMOS repository. We accept contributions from others as Pull Requests.",source:"@site/docs/development/developing.md",sourceDirName:"development",slug:"/development/developing",permalink:"/docs/development/developing",draft:!1,editUrl:"https://github.com/OpenC3/cosmos/tree/main/docs.openc3.com/docs/development/developing.md",tags:[],version:"current",frontMatter:{title:"Developing COSMOS"},sidebar:"defaultSidebar",previous:{title:"Development",permalink:"/docs/development"},next:{title:"Host Install",permalink:"/docs/development/host-install"}},l={},c=[{value:"Development Tools",id:"development-tools",level:2},{value:"Running a Frontend Application",id:"running-a-frontend-application",level:2},{value:"Running a Backend Server",id:"running-a-backend-server",level:2}],s={toc:c},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,o.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"developing-cosmos"},"Developing COSMOS"),(0,r.kt)("p",null,"So you want to help develop COSMOS? All of our open source COSMOS code is on ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/"},"Github")," so the first thing to do is get an ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/join"},"account"),". Next ",(0,r.kt)("a",{parentName:"p",href:"https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository"},"clone")," the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/openc3/cosmos"},"COSMOS")," repository. We accept contributions from others as ",(0,r.kt)("a",{parentName:"p",href:"https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"},"Pull Requests"),"."),(0,r.kt)("h2",{id:"development-tools"},"Development Tools"),(0,r.kt)("p",null,"The core COSMOS team develops with the ",(0,r.kt)("a",{parentName:"p",href:"https://code.visualstudio.com/"},"Visual Studio Code")," editor and we highly recommend it. We also utilize a number of extensions including docker, kubernetes, gitlens, prettier, eslint, python, vetur, and ruby. We commit our ",(0,r.kt)("inlineCode",{parentName:"p"},"openc3.code-workspace")," configuration for VSCode to help configure these plugins. You also need ",(0,r.kt)("a",{parentName:"p",href:"https://www.docker.com/products/docker-desktop"},"Docker Desktop")," which you should already have as it is a requirement to run COSMOS. You'll also need ",(0,r.kt)("a",{parentName:"p",href:"https://nodejs.org/en/download/"},"NodeJS")," and ",(0,r.kt)("a",{parentName:"p",href:"https://yarnpkg.com/getting-started/install"},"yarn")," installed."),(0,r.kt)("h1",{id:"building-cosmos"},"Building COSMOS"),(0,r.kt)("p",null,"Note: We primarily develop COSMOS in MacOS so the commands here will reference bash scripts but the same files exist in Windows as batch scripts."),(0,r.kt)("p",null,"Build COSMOS using the ",(0,r.kt)("inlineCode",{parentName:"p"},"openc3.sh")," script:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"% ./openc3.sh build\n")),(0,r.kt)("p",null,"This will pull all the COSMOS container dependencies and build our local containers. Note: This can take a long time especially for your first build!"),(0,r.kt)("p",null,"Once the build completes you can see the built images with the following command:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},'% docker image ls | grep "openc3"\nopenc3inc/openc3-cosmos-init                latest   4cac7a3ea9d3   29 hours ago   446MB\nopenc3inc/openc3-cosmos-script-runner-api   latest   4aacbaf49f7a   29 hours ago   431MB\nopenc3inc/openc3-cosmos-cmd-tlm-api         latest   9a8806bd4be3   3 days ago     432MB\nopenc3inc/openc3-operator                   latest   223e98129fe9   3 days ago     405MB\nopenc3inc/openc3-base                       latest   98df5c0378c2   3 days ago     405MB\nopenc3inc/openc3-redis                      latest   5a3003a49199   8 days ago     111MB\nopenc3inc/openc3-traefik                    latest   ec13a8d16a2f   8 days ago     104MB\nopenc3inc/openc3-minio                      latest   787f6e3fc0be   8 days ago     238MB\nopenc3inc/openc3-node                       latest   b3ee86d3620a   8 days ago     372MB\nopenc3inc/openc3-ruby                       latest   aa158bbb9539   8 days ago     326MB\n')),(0,r.kt)("admonition",{title:"Offline Building",type:"info"},(0,r.kt)("p",{parentName:"admonition"},"If you're building in a offline environment or want to use a private Rubygems, NPM or APK server (e.g. Nexus), you can update the following environment variables: RUBYGEMS_URL, NPM_URL, APK_URL, and more in the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/openc3/cosmos/blob/main/.env"},".env")," file. Example values:"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre"},"ALPINE_VERSION=3.15<br/>\nALPINE_BUILD=0<br/>\nRUBYGEMS_URL=https://rubygems.org<br/>\nNPM_URL=https://registry.npmjs.org<br/>\nAPK_URL=http://dl-cdn.alpinelinux.org<br/>\n"))),(0,r.kt)("h1",{id:"running-cosmos"},"Running COSMOS"),(0,r.kt)("p",null,"Running COSMOS in development mode enables localhost access to internal API ports as well as sets ",(0,r.kt)("inlineCode",{parentName:"p"},"RAILS_ENV=development")," in the cmd-tlm-api and script-runner-api Rails servers. To run in development mode:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"% ./openc3.sh dev\n")),(0,r.kt)("p",null,"You can now see the running containers (I removed CONTAINER ID, CREATED and STATUS to save space):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},'% docker ps\nIMAGE                                             COMMAND                  PORTS                      NAMES\nopenc3/openc3-cmd-tlm-api:latest         "/sbin/tini -- rails\u2026"   127.0.0.1:2901->2901/tcp   openc3_openc3-cmd-tlm-api_1\nopenc3/openc3-script-runner-api:latest   "/sbin/tini -- rails\u2026"   127.0.0.1:2902->2902/tcp   openc3_openc3-script-runner-api_1\nopenc3/openc3-traefik:latest             "/entrypoint.sh trae\u2026"   0.0.0.0:2900->80/tcp       openc3_openc3-traefik_1\nopenc3/openc3-operator:latest            "/sbin/tini -- ruby \u2026"                              openc3_openc3-operator_1\nopenc3/openc3-minio:latest               "/usr/bin/docker-ent\u2026"   127.0.0.1:9000->9000/tcp   openc3_openc3-minio_1\nopenc3/openc3-redis:latest               "docker-entrypoint.s\u2026"   127.0.0.1:6379->6379/tcp   openc3_openc3-redis_1\n')),(0,r.kt)("p",null,"If you go to localhost:2900 you should see COSMOS up and running!"),(0,r.kt)("h2",{id:"running-a-frontend-application"},"Running a Frontend Application"),(0,r.kt)("p",null,"So now that you have COSMOS up and running how do you develop an individual COSMOS application?"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Bootstrap the frontend with yarn"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"openc3-init % yarn\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Serve a local COSMOS application (CmdTlmServer, ScriptRunner, etc)"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"openc3-init % cd plugins/packages/openc3-tool-scriptrunner\nopenc3-tool-scriptrunner % yarn serve\n\nDONE  Compiled successfully in 128722ms\nApp running at:\n- Local:   http://localhost:2914/tools/scriptrunner/\n- Network: http://localhost:2914/tools/scriptrunner/\n\nNote that the development build is not optimized.\nTo create a production build, run npm run build.\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Set the ",(0,r.kt)("a",{parentName:"p",href:"https://single-spa.js.org/"},"single SPA")," override for the application"),(0,r.kt)("p",{parentName:"li"},"Visit localhost:2900 and Right-click 'Inspect'",(0,r.kt)("br",null),"\nIn the console paste:"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"localStorage.setItem('devtools', true)\n")),(0,r.kt)("p",{parentName:"li"},"Refresh and you should see ",(0,r.kt)("inlineCode",{parentName:"p"},"{...}")," in the bottom right",(0,r.kt)("br",null),"\nClick the Default button next to the application (@openc3/tool-scriptrunner)",(0,r.kt)("br",null),"\nPaste in the development path which is dependent on the port returned by the local yarn serve and the tool name (scriptrunner)"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"http://localhost:2914/tools/scriptrunner/js/app.js\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Refresh the page and you should see your local copy of the application (Script Runner in this example). If you dynamically add code (like ",(0,r.kt)("inlineCode",{parentName:"p"},"console.log"),") the yarn window should re-compile and the browser should refresh displaying your new code. It is highly recommended to get familiar with your browser's ",(0,r.kt)("a",{parentName:"p",href:"https://developer.chrome.com/docs/devtools/overview/"},"development tools")," if you plan to do frontend development."))),(0,r.kt)("h2",{id:"running-a-backend-server"},"Running a Backend Server"),(0,r.kt)("p",null,"If the code you want to develop is the cmd-tlm-api or script-runner-api backend servers there are several steps to enable access to a development copy."),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Run a development version of traefik. COSMOS uses traefik to direct API requests to the correct locations."),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"% cd openc3-traefik\ntraefik % docker ps\n# Look for the container with name including traefik\ntraefik % docker stop openc3_openc3-traefik_1\ntraefik % docker build -f Dockerfile-dev -t openc3-traefik-dev .\ntraefik % docker run --network=openc3-cosmos-network -p 2900:80 -it --rm openc3-traefik-dev\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Run a local copy of the cmd-tlm-api or script-runner-api"),(0,r.kt)("pre",{parentName:"li"},(0,r.kt)("code",{parentName:"pre"},"% cd openc3-cmd-tlm-api\nopenc3-cmd-tlm-api % docker ps\n# Look for the container with name including cmd-tlm-api\nopenc3-cmd-tlm-api % docker stop openc3_openc3-cmd-tlm-api_1\n# Set all the environment variables in the .env file\nopenc3-cmd-tlm-api % bundle install\nopenc3-cmd-tlm-api % bundle exec rails s\n"))),(0,r.kt)("li",{parentName:"ol"},(0,r.kt)("p",{parentName:"li"},"Once the ",(0,r.kt)("inlineCode",{parentName:"p"},"rails s")," command returns you should see API requests coming from interations in the frontend code. If you add code (like Ruby debugging statements) to the cmd-tlm-api code you need to stop the server (CTRL-C) and restart it to see the effect."))))}u.isMDXComponent=!0}}]);