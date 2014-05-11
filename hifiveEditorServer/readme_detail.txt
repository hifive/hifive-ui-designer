リソースフレームワーク詳細

・用語

  http://localhost:8080/restfw-app/resources/person

 上のようなURLに含まれる各部の名称は以下の通り

  "restfw-app" : コンテキストルート
  "resources" ： サービスルート。src/main/resources/appConf/resource-configuration.propertiesのSERVICE_ROOT_PATHで指定
  "person"    ： リソース名(サンプルにあるcom.htmlhifive.resourcefw.sample.resource.person.PersonResourceを指す)。


・リソースクラスの実装について

 1. src/main/javaフォルダに任意のパッケージでクラスを作り、com.htmlhifive.resourcefw.resource.ResourceClassアノテーションを付与する

  ・クラス名から末尾の"Resource"を除去し、全て小文字にしたものがリソース名、publicメソッド名がアクション名であるようなリソースになる

  ・ResourceClassアノテーションの"name"に設定した文字列があればそれがリソース名になり、
   同ResourceMethodアノテーションの"action"に設定した文字列があればそれがアクション名になる


 2. リソースクラスでCRUD処理をJPAで実装する(Spring Data JPA + Hibernate JPA・EntityManagerが使用可能)

  ・GETメソッドは"findById"アクション、PUTは"insertOrUpdate"、POSTは"create"、DELETEは"remove"がデフォルトアクション名であり、
    この名前でメソッドが実装されていれば呼び出される

  ・メッセージメタデータ(メッセージ内で、フレームワークが参照・設定する特殊なデータ)はそのデータキー名が

     src/main/resources/appConf/message-metadata.properties

    で設定できる。
    リソースクラスの実装では、MessageMetadaクラスのインスタンスをRequestMessageから使用する。

  ・com.htmlhifive.resourcefw.message.RequestMessageUtilのstaticメソッドを使うと、
    EntityなどのオブジェクトにRequestMessage内の同名のデータをセットして返してくれる

  ・リソースクラスのメソッドがオブジェクトを返すと、JSONのレスポンスが返る

  ・com.htmlhifive.resourcefw.exceptionパッケージにある
    AbstractResourceExceptionのサブクラスをスローすると、その例外に対応したステータスコードでレスポンスが返る。


 3. アクセスし、確認する

  ・POST以外はURLのパスの最後でIDを表す文字列を指定する。例えば以下では、"person_id_1"がID。

     http://localhost:8080/restfw-app/resources/person/person_id_1

  ・HTTPメソッドごとのデフォルトアクション以外を呼びたいときはリクエストパラメータに"__action"を追加することで、
    そのアクション名に応じたメソッドが呼ばれる



・restfwの汎用ファイルリソースについて

   readme.txtの「restfw-app利用方法」に従いセットアップ(ファイル管理のためのベースディレクトリ、.mime.typesファイルの配置等)しておく

   リソース名は"urltree"(設定変更可能)、なのでURL例としては

      http://localhost:8080/restfw-app/resources/urltree/dir/a.txt

   のようになる。

   対応している動作は以下の通り

  1. 単一ファイルのGET、PUT、DELETE

     デフォルトアクションの通り、findById、insertOrUpdate、removeに対応。 ここで言うIdはファイルパス。

    ・multipartリクエストの例はsrc/main/webapp/static/multipartClient.htmlを参照
     (http://localhost:8080/restfw-app/static/～でアクセスする)


  2. ディレクトリのGET、PUT

     GETはそのディレクトリ内のファイルの情報をJSONで返す。
     PUTでは、ディレクトリ名を__filesDirというキーでリクエストに含めて複数ファイルをリクエストすると、ディレクトリごとinsertOrUpdateする

     ・multipartリクエストの例はsrc/main/webapp/static/multipartClient_dir.html(同上)


  3. その他詳細情報

  ・Controller(いわゆる"RequestHandler"の部分)での受け取り(参考ソース)

     com.htmlhifive.resourcefw.message.MessageContainerMethodProcessor

    のresolveArgumentメソッド、その中でもreadWithMessageConvertersメソッドでcontent-typeを読み、readAsXxxメソッドに振り分けている。


  ・リソースでの受け取り(参考ソース)

     com.htmlhifive.resourcefw.GenericUrlTreeFileResource

    のinsertOrUpdateメソッド→createUrlTreeMetadataメソッド、最終的にsetContentメソッドでRequestMessageから取り出している。
    まずmessageMetadata.REQUEST_CONTENT_KEYというキーでgetしてデータのキーを取得し、さらにそのキーでgetすることでデータを取り出す。

    multipartリクエストの場合はFileValueHolderインターフェース、DirectoryMultipartFileValueHolderクラスで得られる。


 ・リソースでのレスポンスへの設定(参考ソース)

	 com.htmlhifive.resourcefw.GenericUrlTreeFileResource

    findByIdメソッドの120行目～参照。
    125～127行目でmessageMetadata.RESPONSE_HEADERにセットするMapをつくり、それに対してHTTP_HEADER_CONTENT_TYPEをセットしている
    140行目でmessageMetadata.RESPONSE_BODYというキーでInputStreamをputしている

    サブクラスでは、findById(GET)の戻り値が実ファイルデータである場合のみ、editFileResponseメソッドを拡張してレスポンスを編集することができる.
    findByIdはディレクトリに対して行われたときは配下のファイルリスト(JSON)、"metadataOnly"パラメータが付加されているときにはファイルの属性情報(JSON)が返されるが、
    これらの場合にはeditFileResponseは呼ばれない

 ・Controller(いわゆる"ResponseHandler"の部分)でのレスポンス生成

     com.htmlhifive.resourcefw.message.MessageContainerMethodProcessor

   のhandleReturnValueメソッド→convertToResponseEntityメソッド→convertResponseBodyDataメソッドでバイト列として取得、HTTPレスポンスボディに設定している
   680行目～参照。
