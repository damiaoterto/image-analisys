'use strict';
const { get } = require('axios');

class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes: buffer, 
      }
    }).promise();

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 80);

    const names = workingItems
      .map(({ Name }) => Name)
      .join(' and ');

    return { workingItems, names }
  }

  async getImageBuffer(imageUrl) {
    const { data } = await get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(data, 'base64');
    return buffer;
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text,
    }

    const { TranslatedText } = await this.translatorSvc
      .translateText(params)
      .promise();

    return TranslatedText.split(' e ');
  }

  formatTextResult(texts, workingItems) {
    const finalText = [];

    for(const indexText in texts) {
      const nameInPortuguese = texts[indexText];
      const confidence = workingItems[indexText].Confidence;

      finalText.push(`${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`);
    }

    return finalText.join('\n');
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;

      console.log('Downloading Image...')
      const imageBuffer = await this.getImageBuffer(imageUrl);

      console.log('Detecting labels...');
      const { workingItems, names } = await this.detectImageLabels(imageBuffer);

      console.log('Translate to Brazilian Portuguese...');
      const texts = await this.translateText(names);

      console.log('Handling final object...');
      const finalText = this.formatTextResult(texts, workingItems);

      console.log('Finished...');

      return {
        statusCode: 200,
        body: `A imagem tem `.concat(finalText),
      }
    } catch (error) {
      console.log('Error:', error.stack);

      return {
        statusCode: 500,
        body: 'Internal Server Error',
      }
    }
  }
}
// factory
const aws = require('aws-sdk');

const reko = new aws.Rekognition();
const translator = new aws.Translate();

const handler = new Handler({
  rekoSvc: reko,
  translatorSvc: translator,
});

module.exports.main = handler.main.bind(handler);
 