const axios = require("axios");
var cheerio = require('cheerio');
const fs = require('fs');
const fsPromises = fs.promises;
const requestURL = "https://kin.naver.com/ajax/mainNoanswer.nhn"
const TEMP_DATA_FILE_PATH = "temp.data";
const argv = process.argv.slice(2);
const config = require('./config.json');
const send = require('gmail-send')(config);

async function getHTML(req, params) {
    try {
        return await axios.get(req, {
            headers: {
                "referer": "https://kin.naver.com/qna/questionList.nhn",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36"
            },
            params: params
        });
    } catch (error) {
        console.error(error);
    }
}

function makeParameters(keyword) {
    return {
        m: "keyword",
        page: 1,
        keyword: Buffer.from(keyword).toString('base64'), //Must be base64 encoded string
        dirId: 0,
        pageOffset: undefined,
        isPrevPage: undefined,
        countPerPage: 50,
        viewType: "onlyTitle",
        sort: "recent"
    };
}

function compareArray(array1, array2) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
}

function sendNotificationMail(title, url) {
    send({
        subject: `new question "${title}"`,
        text: `url: "${url}"`,
    }, (error, result) => {
        if (error) console.error(error);
        console.log(result);
    });
}

const watchNewQuestions = async (keywords) => {
    const saveData = {};
    const questions = {};
    const resList = await Promise.all(keywords.map(keyword => getHTML(requestURL, makeParameters(keyword))));
    resList.forEach(resultList => {
        resultList.data.result.forEach(questionData => {
            if (questionData.resultList) {
                questionData.resultList.forEach(result => {
                    questions[result.gdid] = result;
                });
            }
        });
        saveData[resultList.config.params.keyword] = Object.keys(questions);
    });
    const dataKeys = Object.keys(saveData);
    try {
        const isInit = !fs.existsSync(TEMP_DATA_FILE_PATH);
        if (isInit) {
            console.log(isInit);
            await fsPromises.writeFile(TEMP_DATA_FILE_PATH, JSON.stringify(saveData));
        }
        const buffer = await fsPromises.readFile(TEMP_DATA_FILE_PATH);
        dataKeys.forEach(keyword => {
            const readData = JSON.parse(buffer.toString());
            if (readData.hasOwnProperty(keyword)) {
                const readKeys = readData[keyword];
                if (compareArray(saveData[keyword], readKeys)) {
                    console.log(`${Buffer.from(keyword, 'base64').toString('utf8')} 키워드의 새로운 질문이 없습니다.`)
                } else {
                    const newQuestions = saveData[keyword].filter(key => !readKeys.includes(key));
                    if (newQuestions.length > 0) {
                        newQuestions.forEach(key => {
                            const question = questions[key];
                            if (question) {
                                const title = cheerio.load(question.title).text();
                                const url = `https://kin.naver.com/qna/detail.nhn?dirId=${question.dirId}&docId=${question.docId}`;
                                console.info(`[${title}] \x1b[36m(${url})\x1b[0m`);
                                console.log(isInit);
                                if (readKeys.length !== 0) {
                                    sendNotificationMail(title, url);
                                }
                            }
                        });
                    }
                }
            }
        });
        await fsPromises.writeFile(TEMP_DATA_FILE_PATH, JSON.stringify(saveData));
    } catch (err) {
        console.error(err)
    }
}

if (argv.length > 0) {
    const watchTimer = (sec, margin) => 1000 * sec + Math.floor(Math.random() * 1000 * margin);
    const watchProcess = () => {
        watchNewQuestions(argv);
        setTimeout(watchProcess, watchTimer(60*10, 60*5));
    }
    watchProcess();
} else {
    console.info("not found question keyword");
}