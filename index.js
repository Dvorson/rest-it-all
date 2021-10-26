import express from 'express';
import { nanoid } from 'nanoid';

const app = express();
const PORT = 3000;

const asyncWrapper = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res);
  } catch (error) {
    next(error);
  }
};

const memo = {};

app.use(express.json());

app.get(
  '/',
  asyncWrapper(async (_, res) => await res.send(JSON.stringify({ memo })))
);

app.get(
  '/api/:resource',
  asyncWrapper(async (req, res) => {
    const {
      params: { resource },
    } = req;
    if (!memo[resource]) {
      return res.sendStatus(404);
    }
    return res.send(JSON.stringify(memo[resource]));
  })
);

app.get(
  '/api/:resource/:_id',
  asyncWrapper(async (req, res) => {
    const {
      params: { resource, _id },
    } = req;
    if (!memo[resource]) {
      return res.sendStatus(404);
    }
    const itemIndex = memo[resource].findIndex(
      ({ _id: itemId }) => itemId === _id
    );
    if (itemIndex === -1) {
      return res.sendStatus(404);
    }
    return res.send(JSON.stringify(memo[resource][itemIndex]));
  })
);

app.post(
  '/api/:resource',
  asyncWrapper(async (req, res) => {
    const {
      params: { resource },
      body = {},
    } = req;
    const item = { ...body, _id: nanoid() };
    if (memo[resource]) {
      return res.send(JSON.stringify(memo[resource].push(item)));
    }
    memo[resource] = [item];
    return res.status(200).send('1');
  })
);

app.put(
  '/api/:resource/:_id',
  asyncWrapper(async (req, res) => {
    const {
      params: { resource, _id },
      body = {},
    } = req;
    if (!memo[resource]) {
      return res.sendStatus(400);
    }
    const itemIndex = memo[resource].findIndex(
      ({ _id: itemId }) => itemId === _id
    );
    if (itemIndex === -1) {
      return res.sendStatus(404);
    }
    memo[resource][itemIndex] = {
      ...memo[resource][itemIndex],
      ...body,
      _id,
    };
    return res.sendStatus(200);
  })
);

app.delete(
  '/api/:resource/:_id',
  asyncWrapper(async (req, res) => {
    const {
      params: { resource, _id },
    } = req;
    if (!memo[resource]) {
      return res.sendStatus(400);
    }
    const itemIndex = memo[resource].findIndex(
      ({ _id: itemId }) => itemId === _id
    );
    if (itemIndex === -1) {
      return res.sendStatus(404);
    }
    memo[resource] = memo[resource].filter(({ _id: itemId }) => itemId === _id);
    return res.sendStatus(200);
  })
);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
