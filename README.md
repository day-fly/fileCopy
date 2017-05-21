# file copy 도우미

개인적으로 쓰려고 만든 간단한 프로그램이다.
회사 개발팀 소속으로 이미 운영되고 있는 시스템을 고도화 하거나 유지보수성 프로젝트를 하는 경우에 운영팀에 개발된 파일을 일일이 전달해야 하는 일이 많았다. 팀 정책상 형상관리 빌드시스템을 쓰지않고 수동으로 반영해야 된다고 하기 때문이었다.

### 개발환경
- electron, node.js, bootstrap

### 기능
- 파일경로를 이용한 파일복사 기능
- SVN revision 정보를 이용한 파일복사 기능
- class 파일 모드 (java대신 class파일복사)
- only 파일, 폴더구조 포함 복사 기능

### 설치
```
$ git clone https://github.com/ddanguri/fileCopy.git
$ npm install
$ npm start
```
