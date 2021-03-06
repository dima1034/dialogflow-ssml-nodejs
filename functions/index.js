// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// This sample shows usage of the available SSML elements

const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');

process.env.DEBUG = 'actions-on-google:*';

/**
 * Sanitize template literal inputs by escaping characters into XML entities to use in SSML
 * Also normalize the extra spacing for better text rendering in SSML
 * A tag function used by ES6 tagged template literals
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @example
 * const equation = '"1 + 1 > 1"';
 * const response = ssml`
 *   <speak>
 *     ${equation}
 *   </speak>
 * `;
 * // Equivalent to ssml`\n  <speak>\n    ${equation}\n  </speak>\n`
 * console.log(response);
 * // Prints: '<speak>&quot;1 + 1 &gt; 1&quot;</speak>'
 *
 * @param {TemplateStringsArray} template Non sanitized constant strings in the template literal
 * @param {Array<string>} inputs Computed expressions to be sanitized surrounded by ${}
 */
const ssml = (template, ...inputs) => template.reduce((out, str, i) => i
  ? out + (
    inputs[i - 1]
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  ) + str
  : str
).trim().replace(/\s+/g, ' ').replace(/ </g, '<').replace(/> /g, '>');

const examples = {
  break: ssml`
    <speak>
      Step 1, take a deep breath. <break time="200ms" strength="weak"/>
      Step 2, exhale.
    </speak>
  `,
  'say-as': ssml`
    <speak>
      This interprets "12345" normally.
      This interprets "<say-as interpret-as="cardinal">12345</say-as>" as a cardinal.
      This interprets "1" normally.
      This interprets "<say-as interpret-as="ordinal">1</say-as>" as an ordinal.
      This interprets "can" normally.
      This interprets "<say-as interpret-as="characters">can</say-as>" as characters.
      This interprets "5+1/2" normally.
      This interprets "<say-as interpret-as="fraction">5+1/2</say-as>" as a fraction.
      This interprets "censored" normally.
      This interprets "<say-as interpret-as="expletive">censored</say-as>" as an expletive.
      This interprets "10 foot" normally.
      This interprets "<say-as interpret-as="unit">10 foot</say-as>" as a unit.
      This interprets "abcdefg" normally.
      This interprets "<say-as interpret-as="verbatim">abcdefg</say-as>" as verbatim.
      This interprets "1960-09-10" normally.
      This interprets "<say-as interpret-as="date" format="ymd">1960-09-10</say-as>" as a date.
      This interprets "2:30pm" normally.
      This interprets "<say-as interpret-as="time" format="hms12">2:30pm</say-as>" as a time.
      This interprets "(781) 771-7777" normally.
      This interprets "<say-as interpret-as="telephone" format="1">
        (781) 771-7777
      </say-as>" as a telephone number.
    </speak>
  `,
  audio: ssml`
    <speak>
      <audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg">
        <desc>Sound of a cat purring.</desc>
        Audio resource for a cat purring failed to load.
      </audio>
    </speak>
  `,
  paragraph: ssml`
    <speak>
      <p>
        <s>This is sentence one.</s>
        <s>This is sentence two.</s>
      </p>
    </speak>
  `,
  sub: ssml`
    <speak>
      This is speaking "W3C" normally.
      This is speaking "<sub alias="World Wide Web Consortium">W3C</sub>" using the sub tag.
    </speak>
  `,
  prosody: ssml`
    <speak>
      <prosody rate="100%" pitch="-2st">
        My name is <prosody rate="slow">Wonder Woman</prosody>.
      </prosody>
      <break time="0.5s" />
      <prosody pitch="+20st">Hi, my name is lowly worm.</prosody>
      <prosody pitch="-10st">Hi, my name is huckleberry cat.</prosody>
      <break time="1.5s" />Was that fun?
      <prosody rate="x-fast">Hi I'm speaking fast.</prosody>
      <prosody rate="x-slow">I'm speaking slow.</prosody>
      <prosody volume="soft">I'm speaking softly.</prosody>
      <prosody volume="x-loud">I'm speaking loud</prosody>
      <prosody pitch="+20st">I'm speaking high.</prosody>
      <prosody pitch="-20st">I'm speaking deep.</prosody>
    </speak>
  `,
  emphasis: ssml`
    <speak>
      I would like to emphasize the importance of SSML.
      I told you to pick up those toys an hour ago.
      <emphasis>I told you to pick up those toys an hour ago.</emphasis>
      <emphasis level="strong">I told you to pick up those toys an hour ago.</emphasis>
      <emphasis level="moderate">I told you to pick up those toys an hour ago.</emphasis>
      <emphasis level="reduced">I told you to pick up those toys an hour ago.</emphasis>
      <emphasis level="none">I told you to pick up those toys an hour ago.</emphasis>
    </speak>
  `,
  speed: ssml`
    <speak>
      This is without prosody.
      <prosody rate="100%">This is speaking at 100% rate.</prosody>
      <prosody rate="150%">This is speaking at 150% rate.</prosody>
      <prosody rate="foo">This is speaking at normal rate.</prosody>
      <prosody rate="200%">This is speaking at 200% rate.</prosody>
      <prosody rate="medium">This is speaking at medium rate.</prosody>
      <prosody rate="300%">This is speaking at 300% rate.</prosody>
      <prosody rate="default">This is speaking at default rate.</prosody>
      <prosody rate="75%">This is speaking at 75% rate.</prosody>
      <prosody rate="50%">This is speaking at 50% rate.</prosody>
      <prosody rate="25%">This is speaking at 25% rate.</prosody>
      <prosody rate="10%">This is speaking at 10% rate.</prosody>
    </speak>
  `,
  volume: ssml`
    <speak>
      This is without prosody.
      <prosody volume="+5dB">This is speaking at +5dB volume.</prosody>
      <prosody volume="100%">This is speaking at 100% volume.</prosody>
      <prosody volume="loud">This is speaking at loud volume.</prosody>
      <prosody volume="foo">This is speaking at normal volume.</prosody>
      <prosody volume="+10dB">This is speaking at +10dB volume.</prosody>
      <prosody volume="medium">This is speaking at medium volume.</prosody>
      <prosody volume="x-loud">This is speaking at x-loud volume.</prosody>
      <prosody volume="default">This is speaking at default volume.</prosody>
      <prosody volume="-5dB">This is speaking at -5dB volume.</prosody>
      <prosody volume="-10dB">This is speaking at -10dB volume.</prosody>
      <prosody volume="soft">This is speaking at soft volume.</prosody>
      <prosody volume="x-soft">This is speaking at x-soft volume.</prosody>
    </speak>
  `,
  pitch: ssml`
    <speak>
      This is without prosody.
      <prosody pitch="+6st">This is speaking at +6 semitones pitch.</prosody>
      <prosody pitch="foo">This is speaking at normal pitch.</prosody>
      <prosody pitch="high">This is speaking at high pitch.</prosody>
      <prosody pitch="+0st">This is speaking at +0 semitones pitch.</prosody>
      <prosody pitch="medium">This is speaking at medium pitch.</prosody>
      <prosody pitch="default">This is speaking at default pitch.</prosody>
      <prosody pitch="+200%">This is speaking at +200% pitch.</prosody>
      <prosody pitch="+12st">This is speaking at +12 semitones pitch.</prosody>
      <prosody pitch="x-high">This is speaking at x-high pitch.</prosody>
      <prosody pitch="-6st">This is speaking at -6 semitones pitch.</prosody>
      <prosody pitch="low">This is speaking at low pitch.</prosody>
      <prosody pitch="-12st">This is speaking at -12 semitones pitch.</prosody>
      <prosody pitch="x-low">This is speaking at x-low pitch.</prosody>
    </speak>
  `
};

/** Dialogflow Actions {@link https://dialogflow.com/docs/actions-and-parameters#actions} */
const Actions = {
  TELL_EXAMPLE: 'tell.example',
  UNRECOGNIZED_DEEP_LINK: 'input.unknown',
  WELCOME: 'input.welcome'
};
/** Dialogflow Parameters {@link https://dialogflow.com/docs/actions-and-parameters#parameters} */
const Parameters = {
  ELEMENT: 'element'
};

const baseResponses = {
  askExample: 'Ask me for an example of a SSML element.'
};

const elements = Object.keys(examples);

const completeResponses = {
  examplesList: `You can ask me about ${elements.slice(0, elements.length - 1).join(', ')}` +
    `, and ${elements[elements.length - 1]}.`,
  didNotUnderstand: `Sorry, I didn't understand you. ${baseResponses.askExample}.`,
  welcome: `Welcome! ${baseResponses.askExample} ` +
    `You can say "give me an example of the prosody element".`,
  /** @param {string} element */
  leadToExample: element => `Ok, here's an SSML example of ${element}.`
};

const actionMap = new Map();
actionMap.set(Actions.WELCOME, /** @param {DialogflowApp} app */ app => {
  const richResponse = app.buildRichResponse()
    .addSimpleResponse(completeResponses.welcome)
    .addSimpleResponse(completeResponses.examplesList);
  app.ask(richResponse);
});
actionMap.set(Actions.TELL_EXAMPLE, /** @param {DialogflowApp} app */ app => {
  const element = app.getArgument(Parameters.ELEMENT);
  if (!element) {
    const richResponse = app.buildRichResponse()
      .addSimpleResponse(completeResponses.didNotUnderstand)
      .addSimpleResponse(completeResponses.examplesList);
    return app.ask(richResponse);
  }
  const richResponse = app.buildRichResponse()
    .addSimpleResponse(completeResponses.leadToExample(element))
    .addSimpleResponse(examples[element]);
  app.ask(richResponse);
});
actionMap.set(Actions.UNRECOGNIZED_DEEP_LINK, /** @param {DialogflowApp} app */ app => {
  const richResponse = app.buildRichResponse()
  .addSimpleResponse(completeResponses.didNotUnderstand)
  .addSimpleResponse(completeResponses.examplesList);
  app.ask(richResponse);
});

/**
 * The entry point to handle a http request
 * @param {Request} request An Express like Request object of the HTTP request
 * @param {Response} response An Express like Response object to send back data
 */
const ssmlExamples = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  console.log('Headers', JSON.stringify(request.headers, null, 2));
  console.log('Body', JSON.stringify(request.body, null, 2));
  app.handleRequest(actionMap);
});

module.exports = {
  ssmlExamples
};
