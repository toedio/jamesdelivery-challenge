# Challenge James Delivery

Abaixo segue o descritivo sobre o challenge do James Deivery. Houve a necessidades de criar funções e filas, AWS Lambda e AWS SQS respectivamente e tudo o que foi criado contém o prefixo ```tv``` que é um acrônimo para "teste victor" para fins de identificação.

Todos os recursos de lambda e SQS foram criada na região de Ohio (us-east-2) a fim de ficar mais próximo geograficamente do bucket e evitar latência de rede.

## Funções Lambda

Nome | Descrição | Código Fonte | Trigger | Variável de ambiente
:--------- | :------ | :------- | :------- | :------- | :-------
tv-sentFromApiGatewayToSqs | Recebe o body do API Gateway e envia para uma fila FIFO | lambda-functions/tv-sentFromApiGatewayToSqs.js | API Gateway ```tv-api``` | SQS_QUEUE_URL
tv-sentAssortmentToS3 | Envia mensagem da fila SQS para S3 | lambda-functions/tv-sentAssortmentToS3.js | Fila SQS ```tv-body-assortment.fifo``` | S3_BUCKET_NAME
tv-sentToSQSFromS3JSONByProductCategories | Le o json de assortments e envia para fila SQS ```tv-process-product-category.fifo``` por categoria | lambda-functions/tv-sentToSQSFromS3JSONByProductCategories.js | Evento PUT do S3. Bucket ```james-s3-bucket-assortment``` | SQS_QUEUE_URL
tv-processCategories | Salva o json de categoria no S3 | lambda-functions/tv-processCategories.js | Fila SQS ```tv-process-product-category.fifo``` | S3_BUCKET_NAME, S3_PREFIX

## Descrição do Challenge

Abaixo segue como cada problema proposto no enunciado foi resolvido, visando explicar a linha de raciocínio e também cada decisão técnica que foi tomada.

> 	1 - Criar um serviço que tenha sua chamada via APIGATEWAY :
        1.0 - Imprescindível que o seu APIGATEWAY tenha uma chave de utilização.
	    1.1 - Este serviço deverá enviar o seu corpo para um FILA SQS FIFO(utilizar lambda para enviar para a fila sqs).

Foi criada a REST API ```tv-victor``` utilizando o serviço API Gateway. Nele, contém apenas um recurso POST na raíz do serviço. A URL gerada após deploy foi ```https://lkomyxfip6.execute-api.us-east-2.amazonaws.com/test```. O recurso foi configurado para que a cada requisição fosse enviado o corpo da requisição para o lambda ```tv-body-assortment.fifo```.

O lambda ```tv-body-assortment.fifo``` por sua vez recebe cada requisição e envia a mensagem para a fila FIFO. Foi utilizado como chave para agrupamento de mensagem o nome do lambda e para chave de duplicidade o identificador da requisição que a própria AWS fornece. A fim de evitar erros, o lambda só responde sucesso caso consiga enviar a mensagem para a fila, evitando assim dados perdidos.

> 1.2 - Esta fila FIFO devera chamar um lambda para processar os dados contidos na fila
1.3 - Este lambda deverá enviar o seu processamento para o S3 , dentro de um bucket chamado james-s3-bucket-assortment(pasta raiz).
1.4 - O arquivo devera ser no formato Json.

Foi criado o lambda ```tv-sentAssortmentToS3``` que tem como trigger mensagens da fila ```tv-body-assortment.fifo``` e para cada mensagem ele salva o corpo da mensagem como arquivo .json no S3.

>2º - Criar um serviço que processa um arquivo que esta em um bucket S3
1.1 - Este serviço no S3 deverá ser ativado após um evento de PUT na pasta james-s3-bucket-assortment.
1.2 - Este evento devera enviar para uma fila FIFO os dados do arquivo através de um lambda.
1.2.1 - Os dados do arquivo deveram ser enviados por categoria de produto.

Foi criado o lambda ```tv-sentToSQSFromS3JSONByProductCategories``` que tem como trigger eventos 'PUT' no bucket ```james-s3-bucket-assortment``` de arquivos .json. O filtro para processar apenas arquivos da raiz foi feito no código do próprio lambda.

Para cada arquivo recebido, o contéudo é convertido para JSON e cada categoria é enviada para a fila ```tv-process-product-category.fifo```. Foi usado como chave para agrupamento de mensagens o código da loja (```storeId```) e como chave de duplicação o código do GPA (```gpaId```)

> 1.3 - Esta fila com os dados divididos em categoria devera ser processado por um lambda.
1.4 - Após o processamento do arquivo ele devera ser enviado para uma pasta no S3 chamada james-s3-bucket-assortment/processados
1.5 - Os arquivos deveram ser gerados na pasta james-s3-bucket-assortment/processados com a data do dia

Foi criado o lambda ```tv-processCategories.js``` que tem como trigger mensagem da fila ```tv-process-product-category.fifo```. Para cada mensagem é saldo no S3 o arquivo .json com o corpo da mensagem. Os arquivos são salvos na pasta processados respeitando o template de chave dia/mes/ano/arquiviProcessadoCategoriaX.json.