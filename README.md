# NotificationNaverQuestion
원하는 키워드에 해당하는 네이버 질문글이 새롭게 올라오면 G메일로 알려주는 프로그램 입니다.
참고로 이거 사용해서 생기는 불이익은 책임안짐 수고용
사용하기 전 config.json 파일을 구성해야합니다.

### 준비 1: 구글 G-mail 보안 설정
만약 보낼 gmail 의 구글 계정이 보안 2단계 인증을 설정하지 않은 상태라면 '보안 수준이 낮은 앱' 접근이 가능하도록 하여야 합니다.
방법은 [보안 수준 낮은 앱 권한 설정](https://github.com/alykoshin/gmail-send/blob/HEAD/doc/configure-less-secure.md) 참고.

2단계 인증을 설정해 둔 상태라면 [내 계정 -> 로그인 및 보안 -> Google에 로그인 -> 앱 비밀번호](https://accounts.google.com/signin/v2/sl/pwd?service=accountsettings&passive=1209600&osid=1&continue=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords%3Futm_source%3DOGB%26pli%3D1&followup=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords%3Futm_source%3DOGB%26pli%3D1&rart=ANgoxccNxOPrIcum8ufJAxltrEBVKaKd0qo1s8WIoKzSA-EIB3nw5iPI4T3IJWkIUP6Xc5I0cCsETYnsZaDzzVgpDAJ-SssnuQ&authuser=0&csig=AF-SEna5bPzvF2hqAJVe%3A1588876721&flowName=GlifWebSignIn&flowEntry=ServiceLogin)에서 앱 선택-기타 로 설정하여 앱 비밀번호를 생성해야 합니다. 이름은 원하는 이름으로 설정한 후, [생성]을 누르면 앱 비밀번호를 얻습니다. 이 앱 비밀번호를 아래 준비 2단계의 config.json 파일의 "pass"의 값으로 넣어줍니다.

### 준비 2: config.json
```
{
    "user": "dorothy9795@gmail.com",
    "pass": "google two-step verification password(this is not google password)",
    "to": "dorothy9795@gmail.com"
}
```

### 사용방법
````
node app.js "점심밥 추천" "이게 뭔가요?"
````
