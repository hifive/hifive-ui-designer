リソースフレームワーク利用方法


0. プロジェクトをチェックアウト


1. 依存ライブラリの配置

 ivy_build.xmlを右クリック「実行」→Antビルド ※proxyが必要な場合は「構成の編集」から「ワークスペースと同じJREで実行する」等する


2. DB(HSQLDB)の設定

 以下のプロパティファイルの"jdbc.url"に指定した場所にDBが作られる(Standaloneモード：アプリ起動中はmanagerが使えないモード)
  src/main/resources/appConf/jdbc.properties


3. 汎用ファイル管理リソース(GenericUrlTreeFileResource)の利用準備

 ベースディレクトリとして以下のプロパティファイルに記載したフォルダを作成しておく
  src/main/resources/appConf/fileresource.properties


4. Simple Rest Client(Chromeエクステンション)のインストール

 Chromeブラウザで以下を開き、
  chrome://extensions/

 以下のファイルをドラッグアンドドロップするとインストールできる.
  tool/extension_1_2.crx


5. 動作確認

 コンテキスト定義を更新してTomcatを起動、クライアントツールから以下のリクエストを発行する

 <PUT>
  URL : http://localhost:8080/restfw-app/resources/urltree/testdir/test.txt
  Method : PUT
  Data : (任意の文字列)

   200 OKが返り、ベースディレクトリにtestdirディレクトリ、さらにその中にtest.txtが生成されることを確認する

 <GET>
  URL : PUTと同じ
  Method : GET

   200 OKが返り、「Data」にPUTで入力した文字列が表示されることを確認する


-----

補足・その他


・HSQLDBのマネージャアプリ

 HSQLDBのマネージャアプリは、以下のバッチファイルで起動することができる。

  hsqldb/runmanager.bat

 URL等の接続情報はsrc/main/resources/appConf/jdbc.propertiesに合わせて入力する。


・MIMEタイプの設定ファイルの配置

 以下のファイル配置を行うと、レスポンスヘッダのContent-Typeに含まれるMIMEタイプに応じてブラウザが適切に表示を行うようになる.

 src/main/resources/META-INFに配置されている
  mime.types
 を
  .mime.types
 にリネーム(先頭の"."を追加)してユーザーのホームディレクトリ(WindowsならC:\Users\xxx)に配置する


・SpringSecurityによるBASIC認証設定(簡易)

 readme_securityConfig.txt を参照。


・実装詳細について

 readme_detail.txt を参照。

