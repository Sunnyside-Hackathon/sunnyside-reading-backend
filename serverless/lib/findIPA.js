const { JSONPath } = require('jsonpath-plus');

module.exports.find = (dictArray, word) => {
    for (const json of dictArray) {
        let res = JSONPath({
            json,
            path: '$.hwi.hw'
        });

        if (res[0] && res[0].replace('*', '') === word) {
            res = JSONPath({
                json,
                path: '$.hwi.prs[*].ipa'
            });

            if (res.length > 0) {
                console.log(res);
                return res[0];
            }
        } else {
            res = JSONPath({
                json,
                path: `$.ins[?(@.if === "${word}")].prs[*].ipa`
            });

            if (res.length > 0) {
                console.log(res);
                return res[0];
            }
        }
    }

    return "";
};
