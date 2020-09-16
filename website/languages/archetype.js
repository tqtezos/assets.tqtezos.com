/*
Language: Archetype
Author: Benoit Rognier <benoit.rognier@edukera.com>
Description: Archetype language. For info about language
Website: https://archetype-lang.org/
Category: common, system
*/

function getArchetype(hljs) {
  var AR_KEYWORDS = {
    keyword:
      'asset identified by let some in otherwise entry specification before initialized forall removed added and fails with require if then effect var dofailif transfer contract getter return',
    literal:
       'true false',
    built_in:
      'sum isempty length update addupdate'
  };
  return {
    name: 'archetype',
    aliases: ['ar'],
    keywords: AR_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'string',
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {begin: '`', end: '`'},
        ]
      },
      {
        className: 'number',
        variants: [
          {begin: hljs.C_NUMBER_RE + '[i]', relevance: 1},
          hljs.C_NUMBER_MODE
        ]
      },
      {
        begin: /:=/ // relevance booster
      },
      {
        className: 'function',
        beginKeywords: 'asset fails', end: '\\s*(\\{|$)', excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            keywords: AR_KEYWORDS,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}

exports.getdef = getArchetype