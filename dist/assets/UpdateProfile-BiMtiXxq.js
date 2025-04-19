import{T as we,U as j,_ as be,V as ye,W as Re,X as Te,Y as xe,Z as ke,$ as Ee,a0 as K,a1 as Ne,J as Ae,u as Ue,r as O,j as a,H as Ce,m as _,L as ve}from"./index-DGnBJfx4.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ee="firebasestorage.googleapis.com",te="storageBucket",Oe=2*60*1e3,Ie=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class p extends xe{constructor(t,n,s=0){super(M(t),`Firebase Storage: ${n} (${M(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,p.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return M(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var f;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(f||(f={}));function M(e){return"storage/"+e}function V(){const e="An unknown error occurred, please check the error payload for server response.";return new p(f.UNKNOWN,e)}function Pe(e){return new p(f.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function De(e){return new p(f.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Le(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new p(f.UNAUTHENTICATED,e)}function Se(){return new p(f.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function je(e){return new p(f.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function Fe(){return new p(f.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Be(){return new p(f.CANCELED,"User canceled the upload/download.")}function Me(e){return new p(f.INVALID_URL,"Invalid URL '"+e+"'.")}function He(e){return new p(f.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function $e(){return new p(f.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+te+"' property when initializing the app?")}function Ve(){return new p(f.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function qe(){return new p(f.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function ze(e){return new p(f.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function $(e){return new p(f.INVALID_ARGUMENT,e)}function ne(){return new p(f.APP_DELETED,"The Firebase app was deleted.")}function We(e){return new p(f.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function P(e,t){return new p(f.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function I(e){throw new p(f.INTERNAL_ERROR,"Internal error: "+e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=T.makeFromUrl(t,n)}catch{return new T(t,"")}if(s.path==="")return s;throw He(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(R){R.path.charAt(R.path.length-1)==="/"&&(R.path_=R.path_.slice(0,-1))}const i="(/(.*))?$",l=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function h(R){R.path_=decodeURIComponent(R.path)}const g="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),w="(/([^?#]*).*)?$",x=new RegExp(`^https?://${y}/${g}/b/${r}/o${w}`,"i"),k={bucket:1,path:3},d=n===ee?"(?:storage.googleapis.com|storage.cloud.google.com)":n,u="([^?#]*)",m=new RegExp(`^https?://${d}/${r}/${u}`,"i"),N=[{regex:l,indices:c,postModify:o},{regex:x,indices:k,postModify:h},{regex:m,indices:{bucket:1,path:2},postModify:h}];for(let R=0;R<N.length;R++){const D=N[R],F=D.regex.exec(t);if(F){const ge=F[D.indices.bucket];let B=F[D.indices.path];B||(B=""),s=new T(ge,B),D.postModify(s);break}}if(s==null)throw Me(t);return s}}class Xe{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ke(e,t,n){let s=1,r=null,o=null,i=!1,l=0;function c(){return l===2}let h=!1;function g(...u){h||(h=!0,t.apply(null,u))}function y(u){r=setTimeout(()=>{r=null,e(x,c())},u)}function w(){o&&clearTimeout(o)}function x(u,...m){if(h){w();return}if(u){w(),g.call(null,u,...m);return}if(c()||i){w(),g.call(null,u,...m);return}s<64&&(s*=2);let N;l===1?(l=2,N=0):N=(s+Math.random())*1e3,y(N)}let k=!1;function d(u){k||(k=!0,w(),!h&&(r!==null?(u||(l=2),clearTimeout(r),y(0)):u||(l=1)))}return y(0),o=setTimeout(()=>{i=!0,d(!0)},n),d}function Ge(e){e(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(e){return e!==void 0}function Ye(e){return typeof e=="object"&&!Array.isArray(e)}function q(e){return typeof e=="string"||e instanceof String}function G(e){return z()&&e instanceof Blob}function z(){return typeof Blob<"u"}function Z(e,t,n,s){if(s<t)throw $(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw $(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function W(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function se(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var C;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(C||(C={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Je(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(t,n,s,r,o,i,l,c,h,g,y,w=!0){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=l,this.errorCallback_=c,this.timeout_=h,this.progressCallback_=g,this.connectionFactory_=y,this.retry=w,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((x,k)=>{this.resolve_=x,this.reject_=k,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new L(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=l=>{const c=l.loaded,h=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,h)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const l=o.getErrorCode()===C.NO_ERROR,c=o.getStatus();if(!l||Je(c,this.additionalRetryCodes_)&&this.retry){const g=o.getErrorCode()===C.ABORT;s(!1,new L(!1,null,g));return}const h=this.successCodes_.indexOf(c)!==-1;s(!0,new L(h,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,l=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(l,l.getResponse());Ze(c)?o(c):o()}catch(c){i(c)}else if(l!==null){const c=V();c.serverResponse=l.getErrorText(),this.errorCallback_?i(this.errorCallback_(l,c)):i(c)}else if(r.canceled){const c=this.appDelete_?ne():Be();i(c)}else{const c=Fe();i(c)}};this.canceled_?n(!1,new L(!1,null,!0)):this.backoffId_=Ke(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Ge(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class L{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function et(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function tt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function nt(e,t){t&&(e["X-Firebase-GMPID"]=t)}function st(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function rt(e,t,n,s,r,o,i=!0){const l=se(e.urlParams),c=e.url+l,h=Object.assign({},e.headers);return nt(h,t),et(h,n),tt(h,o),st(h,s),new Qe(c,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ot(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function it(...e){const t=ot();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(z())return new Blob(e);throw new p(f.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function at(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lt(e){if(typeof atob>"u")throw ze("base-64");return atob(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class H{constructor(t,n){this.data=t,this.contentType=n||null}}function ct(e,t){switch(e){case A.RAW:return new H(re(t));case A.BASE64:case A.BASE64URL:return new H(oe(e,t));case A.DATA_URL:return new H(ht(t),dt(t))}throw V()}function re(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function ut(e){let t;try{t=decodeURIComponent(e)}catch{throw P(A.DATA_URL,"Malformed data URL.")}return re(t)}function oe(e,t){switch(e){case A.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case A.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=lt(t)}catch(r){throw r.message.includes("polyfill")?r:P(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class ie{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw P(A.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=ft(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function ht(e){const t=new ie(e);return t.base64?oe(A.BASE64,t.rest):ut(t.rest)}function dt(e){return new ie(e).contentType}function ft(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(t,n){let s=0,r="";G(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(G(this.data_)){const s=this.data_,r=at(s,t,n);return r===null?null:new U(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new U(s,!0)}}static getBlob(...t){if(z()){const n=t.map(s=>s instanceof U?s.data_:s);return new U(it.apply(null,n))}else{const n=t.map(i=>q(i)?ct(A.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let l=0;l<i.length;l++)r[o++]=i[l]}),new U(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ae(e){let t;try{t=JSON.parse(e)}catch{return null}return Ye(t)?t:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pt(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function mt(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function le(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _t(e,t){return t}class b{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||_t}}let S=null;function gt(e){return!q(e)||e.length<2?e:le(e)}function ce(){if(S)return S;const e=[];e.push(new b("bucket")),e.push(new b("generation")),e.push(new b("metageneration")),e.push(new b("name","fullPath",!0));function t(o,i){return gt(i)}const n=new b("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new b("size");return r.xform=s,e.push(r),e.push(new b("timeCreated")),e.push(new b("updated")),e.push(new b("md5Hash",null,!0)),e.push(new b("cacheControl",null,!0)),e.push(new b("contentDisposition",null,!0)),e.push(new b("contentEncoding",null,!0)),e.push(new b("contentLanguage",null,!0)),e.push(new b("contentType",null,!0)),e.push(new b("metadata","customMetadata",!0)),S=e,S}function wt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new T(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function bt(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return wt(s,e),s}function ue(e,t,n){const s=ae(t);return s===null?null:bt(e,s,n)}function yt(e,t,n,s){const r=ae(t);if(r===null||!q(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(h=>{const g=e.bucket,y=e.fullPath,w="/b/"+i(g)+"/o/"+i(y),x=W(w,n,s),k=se({alt:"media",token:h});return x+k})[0]}function Rt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class he{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(e){if(!e)throw V()}function Tt(e,t){function n(s,r){const o=ue(e,r,t);return de(o!==null),o}return n}function xt(e,t){function n(s,r){const o=ue(e,r,t);return de(o!==null),yt(o,r,e.host,e._protocol)}return n}function fe(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=Se():r=Le():n.getStatus()===402?r=De(e.bucket):n.getStatus()===403?r=je(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function kt(e){const t=fe(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=Pe(e.path)),o.serverResponse=r.serverResponse,o}return n}function Et(e,t,n){const s=t.fullServerUrl(),r=W(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,l=new he(r,o,xt(e,n),i);return l.errorHandler=kt(t),l}function Nt(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function At(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=Nt(null,t)),s}function Ut(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function l(){let N="";for(let R=0;R<2;R++)N=N+Math.random().toString().slice(2);return N}const c=l();i["Content-Type"]="multipart/related; boundary="+c;const h=At(t,s,r),g=Rt(h,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+g+`\r
--`+c+`\r
Content-Type: `+h.contentType+`\r
\r
`,w=`\r
--`+c+"--",x=U.getBlob(y,s,w);if(x===null)throw Ve();const k={name:h.fullPath},d=W(o,e.host,e._protocol),u="POST",m=e.maxUploadRetryTime,E=new he(d,u,Tt(e,n),m);return E.urlParams=k,E.headers=i,E.body=x.uploadData(),E.errorHandler=fe(t),E}class Ct{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=C.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=C.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=C.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r){if(this.sent_)throw I("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(n,t,!0),r!==void 0)for(const o in r)r.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,r[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw I("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw I("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw I("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw I("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class vt extends Ct{initXhr(){this.xhr_.responseType="text"}}function pe(){return new vt}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class v{constructor(t,n){this._service=t,n instanceof T?this._location=n:this._location=T.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new v(t,n)}get root(){const t=new T(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return le(this._location.path)}get storage(){return this._service}get parent(){const t=pt(this._location.path);if(t===null)return null;const n=new T(this._location.bucket,t);return new v(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw We(t)}}function Ot(e,t,n){e._throwIfRoot("uploadBytes");const s=Ut(e.storage,e._location,ce(),new U(t,!0),n);return e.storage.makeRequestWithTokens(s,pe).then(r=>({metadata:r,ref:e}))}function It(e){e._throwIfRoot("getDownloadURL");const t=Et(e.storage,e._location,ce());return e.storage.makeRequestWithTokens(t,pe).then(n=>{if(n===null)throw qe();return n})}function Pt(e,t){const n=mt(e._location.path,t),s=new T(e._location.bucket,n);return new v(e.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(e){return/^[A-Za-z]+:\/\//.test(e)}function Lt(e,t){return new v(e,t)}function me(e,t){if(e instanceof X){const n=e;if(n._bucket==null)throw $e();const s=new v(n,n._bucket);return t!=null?me(s,t):s}else return t!==void 0?Pt(e,t):e}function St(e,t){if(t&&Dt(t)){if(e instanceof X)return Lt(e,t);throw $("To use ref(service, url), the first argument must be a Storage instance.")}else return me(e,t)}function Y(e,t){const n=t==null?void 0:t[te];return n==null?null:T.makeFromBucketSpec(n,e)}function jt(e,t,n,s={}){e.host=`${t}:${n}`,e._protocol="http";const{mockUserToken:r}=s;r&&(e._overrideAuthToken=typeof r=="string"?r:Re(r,e.app.options.projectId))}class X{constructor(t,n,s,r,o){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._bucket=null,this._host=ee,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Oe,this._maxUploadRetryTime=Ie,this._requests=new Set,r!=null?this._bucket=T.makeFromBucketSpec(r,this._host):this._bucket=Y(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=T.makeFromBucketSpec(this._url,t):this._bucket=Y(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){Z("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){Z("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Te(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new v(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new Xe(ne());{const i=rt(t,this._appId,s,r,n,this._firebaseVersion,o);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const J="@firebase/storage",Q="0.13.7";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _e="storage";function Ft(e,t,n){return e=j(e),Ot(e,t,n)}function Bt(e){return e=j(e),It(e)}function Mt(e,t){return e=j(e),St(e,t)}function Ht(e=we(),t){e=j(e);const s=be(e,_e).getImmediate({identifier:t}),r=ye("storage");return r&&$t(s,...r),s}function $t(e,t,n,s={}){jt(e,t,n,s)}function Vt(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new X(n,s,r,t,Ne)}function qt(){ke(new Ee(_e,Vt,"PUBLIC").setMultipleInstances(!0)),K(J,Q,""),K(J,Q,"esm2017")}qt();const Wt=()=>{const{user:e,updateUserProfile:t}=Ae(),n=Ue(),s=Ht(),[r,o]=O.useState(""),[i,l]=O.useState(""),[c,h]=O.useState(""),[g,y]=O.useState("");O.useEffect(()=>{e&&(o(e.displayName||""),l(e.photoURL||""))},[e]);const w=async u=>{if(h(""),!u.type.startsWith("image/")){h("Only image files are allowed.");return}if(u.size>5*1024*1024){h("Image size should be under 5MB.");return}const m=Mt(s,`avatars/${e.uid}/${u.name}`);try{await Ft(m,u);const E=await Bt(m);l(E)}catch(E){h("Failed to upload image."),console.error("Upload error:",E)}},x=()=>{window.cloudinary.openUploadWidget({cloudName:"dkmxpffpk",uploadPreset:"unsigned_avatars",integration:"popup",sources:["local","camera"],cropping:!0,folder:"avatars",multiple:!1,maxFileSize:5*1024*1024,styles:{palette:{window:"#2A303F",sourceBg:"#151B29",windowBorder:"#8E8E8E",tabIcon:"#FFFFFF",inactiveTabIcon:"#D3D3D3",menuIcons:"#FFF",link:"#374151",action:"#FF5722",inProgress:"#FF9800",complete:"#4CAF50",error:"#F44336",textDark:"#000000",textLight:"#FFFFFF"},fonts:{default:null,"'Biotif', sans-serif":{active:!0}}}},(u,m)=>{!u&&m.event==="success"&&l(m.info.secure_url)})},k=async u=>{u.preventDefault(),h(""),y("");try{await t({displayName:r,photoURL:i}),y("Profile updated successfully."),setTimeout(()=>n("/profile"),2e3)}catch(m){console.error("Update profile error:",m),h("Failed to update profile.")}},d={initial:{opacity:0,y:60},animate:{opacity:1,y:0,transition:{type:"spring",stiffness:350,damping:25,mass:1}},exit:{opacity:0,y:-60}};return a.jsxs(a.Fragment,{children:[a.jsxs(Ce,{children:[a.jsx("title",{children:"Update Profile - Cinespin"}),a.jsx("meta",{name:"description",content:"Update your Cinespin profile information including display name and profile picture for a personalized experience."})]}),a.jsxs("div",{className:"login-container",children:[a.jsx("div",{className:"form-section",children:a.jsxs(_.div,{className:"form-content",...d,children:[a.jsxs(_.h1,{className:"form-title",...d,children:[a.jsx(_.span,{className:"text-highlight",...d,children:"Update"})," ",a.jsx(_.span,{className:"text-muted",...d,children:"Profile"})]}),a.jsx(_.div,{className:"form-subtitle",...d,children:a.jsx(_.p,{...d,children:"Modify your profile details"})}),a.jsx(_.div,{className:"profile-photo-wrapper",...d,style:{display:"flex",justifyContent:"center",marginBottom:"2rem",position:"relative"},children:a.jsxs(_.div,{onClick:x,onDragOver:u=>u.preventDefault(),onDrop:u=>{u.preventDefault();const m=u.dataTransfer.files[0];m&&w(m)},style:{width:"8rem",height:"8rem",borderRadius:"50%",overflow:"hidden",border:"3px solid #ccc",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#f0f0f0",transition:"border-color 0.3s ease"},className:"profile-photo-drop",...d,children:[a.jsx(_.img,{src:i||"/download.svg",alt:"Profile Preview",style:{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"},onError:u=>{u.target.onerror=null,u.target.src="/download.svg"},...d}),a.jsx("input",{id:"photoUpload",type:"file",accept:"image/*",onChange:u=>{const m=u.target.files[0];m&&w(m)},style:{display:"none"}})]})}),a.jsx(_.form,{onSubmit:k,autoComplete:"on",noValidate:!0,...d,children:a.jsxs("div",{className:"form-group",children:[a.jsxs(_.div,{className:"form-control",...d,children:[a.jsx(_.label,{htmlFor:"displayName",...d,children:"Display Name"}),a.jsx(_.input,{id:"displayName",type:"text",value:r,onChange:u=>o(u.target.value),required:!0,...d})]}),c&&a.jsx("div",{className:"error-message",role:"alert",children:c}),g&&a.jsx("div",{className:"success-message",role:"status",children:g}),a.jsxs(_.div,{className:"submit-container",...d,children:[a.jsx("button",{type:"submit",className:"submit-button",children:"Update Profile"}),a.jsx("div",{className:"form-links",children:a.jsx(ve,{to:"/profile",children:"Back to Profile"})})]})]})})]})}),a.jsx(_.div,{className:"pattern-section",...d,children:a.jsx(_.div,{className:"pattern-svg",...d,children:a.jsxs(_.svg,{viewBox:"0 0 400 800",xmlns:"http://www.w3.org/2000/svg",className:"pattern",...d,children:[a.jsxs(_.defs,{...d,children:[a.jsxs("linearGradient",{id:"gradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[a.jsx("stop",{offset:"0%",stopColor:"#1E293B"}),a.jsx("stop",{offset:"50%",stopColor:"#334155"}),a.jsx("stop",{offset:"100%",stopColor:"#475569"})]}),a.jsxs("mask",{id:"mask",x:"0",y:"0",width:"100%",height:"100%",children:[a.jsx("rect",{width:"100%",height:"100%",fill:"white"}),a.jsx("circle",{cx:"200",cy:"400",r:"250",fill:"black"})]})]}),a.jsxs("g",{mask:"url(#mask)",children:[a.jsx(_.path,{d:"M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z",fill:"url(#gradient)",...d,children:a.jsx("animate",{attributeName:"d",dur:"12s",repeatCount:"indefinite",values:`
                    M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z;
                    M0,800 C100,600 200,700 300,600 C400,700 500,600 600,700 C700,600 800,700 900,800 L900,0 L0,0 Z;
                    M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z
                  `})}),a.jsx("circle",{cx:"200",cy:"400",r:"250",fill:"white",opacity:"0.5",children:a.jsx("animate",{attributeName:"r",dur:"8s",values:"250;200;250",repeatCount:"indefinite"})})]})]})})})]})]})};export{Wt as default};
