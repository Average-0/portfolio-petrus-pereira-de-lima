# 🧠 BiasLens: Visual Classification & Algorithmic Bias Lab

![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Teachable Machine](https://img.shields.io/badge/Teachable_Machine-4285F4?style=for-the-badge&logo=google&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 📝 Descrição do Projeto

O **BiasLens** é um experimento de classificação visual construído com o **Teachable Machine** (Google) para demonstrar, de forma prática e controlada, como decisões na curadoria de dados corrompem a lógica de modelos de inteligência artificial. O modelo foi treinado com um dataset deliberadamente enviesado: utilizando critérios estereotipados de vestimenta e gênero: para simular o tipo de viés que sistemas reais de triagem profissional frequentemente reproduzem sem transparência.

O projeto combina experimentação técnica com análise crítica de impacto social, evidenciando que a responsabilidade sobre o comportamento de um modelo começa antes do treinamento: nas escolhas de quem cuida dos dados.

---

![Registro de Falso Positivo](./.github/falso_positivo.png)
*Figura 1: Inferência incorreta: modelo classifica com 98% de confiança como "Pessoa Operacional" com base exclusivamente em características visuais superficiais.*

## 🚀 Tecnologias Utilizadas

* **Motor de Treinamento:** Teachable Machine v2.4 (Google)
* **Runtime de Inferência:** TensorFlow.js 1.7.4
* **Formato do Modelo:** TF.js Graph Model (model.json + weights.bin)
* **Metadados:** metadata.json com labels e configurações de imagem (224px)
* **Captura e Teste:** Câmera em tempo real via navegador

## 📊 Resultados e Funcionalidades

O experimento foi estruturado para evidenciar mecanismos reais de viés algorítmico em sistemas de classificação profissional:

* **Dataset Enviesado (Intencional):** 20 imagens por classe, utilizando homens de terno para "Perfil Liderança" e pessoas com roupas casuais para "Perfil Operacional".
* **Registro de Falso Positivo:** Classificação incorreta com 93% de confiança, documentando o momento em que o modelo falha por replicar estereótipos do dataset.
* **Análise de Mecanismo:** Demonstração prática de como características visuais superficiais substituem competência como critério de decisão.
* **Proposta Human-in-the-loop:** Intervenção de curadoria diversa e auditoria periódica como mitigação do viés antes da implementação.


## ✍️ Memorial de Impacto e Ética

**Mecanismo do Viés**

A seleção restrita de dados corrompe a lógica do algoritmo porque o modelo aprende apenas os padrões presentes no dataset, e não a realidade em sua complexidade. Quando o sistema recebe somente imagens de homens de terno como "Perfil Liderança" e pessoas com roupas casuais como "Perfil Operacional", ele passa a associar características visuais superficiais: como vestimenta e gênero: a competências profissionais. O algoritmo não avalia capacidade nem contexto: ele replica o estereótipo que o dataset impõe e, com isso, produz uma visão distorcida da realidade. O viés não surge por acidente: ele nasce diretamente das escolhas feitas por quem cuida dos dados.

**Consequência Social**

O indivíduo marginalizado pelo sistema enfrenta impactos diretos em sua trajetória profissional e emocional. Um jovem qualificado que usa roupa casual, por exemplo, é automaticamente descartado em um processo seletivo automatizado sem que suas habilidades sejam sequer consideradas. Essa exclusão silenciosa gera frustração, abala a autoestima e reforça desigualdades que já existem na sociedade. A pessoa sente que algo está errado, mas não consegue identificar onde o processo falhou. O sistema não enxerga quem ela é: enxerga apenas o que ela veste, e decide o futuro com base nisso.

**Ação Mitigadora: Human-in-the-loop**

Antes da implementação do modelo, um comitê diverso de pessoas revisa e valida o dataset, assegurando representatividade de gênero, raça, idade e estilo de vida. O processo de curadoria inclui critérios claros de equidade e passa por auditorias periódicas. Nenhuma decisão final é tomada exclusivamente pelo algoritmo: um profissional humano analisa os casos, questiona classificações duvidosas e corrige distorções. Essa intervenção garante que o modelo funcione como um apoio à decisão e não como substituto do julgamento humano, preservando a dignidade e as oportunidades de cada indivíduo avaliado.

## 🔧 Como Executar

1. Acesse o [Teachable Machine](https://teachablemachine.withgoogle.com/).
2. Clique em **Open an existing project → From file**.
3. Carregue os arquivos da pasta `model/` (`model.json`, `weights.bin` e `metadata.json`).
4. Teste a inferência com a câmera em tempo real.


---

[Voltar ao início](#-biaslens-visual-classification--algorithmic-bias-lab)
