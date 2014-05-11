BASIC認証設定方法

1. web.xmlの変更

  SpringSecurityフィルタ」のコメントを外し、有効にする


2. AuthorizationManagerのBean定義変更

  src/main/resources/spring/security-prop.xml

 に記載されている、"urlTreeAuthorizationManager"のBean定義を、コメントアウトされている方に切り替える


3. ユーザー、パスワードの変更

  src/main/resources/users.properties

 を修正する。形式は以下の通り

   ユーザー名=パスワード,"ROLE_ADMIN"(ロール名)


4. アクセス

  任意のURLにアクセスし、BASIC認証のダイアログが表示されることを確認する

-----

・security-prop.xmlとusers.propertiesの記述により、様々な認可設定が可能
