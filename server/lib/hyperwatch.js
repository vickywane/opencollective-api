import Hyperwatch from '@hyperwatch/hyperwatch';

const hyperwatch = Hyperwatch();

export const input = hyperwatch.input.express.create();

export const middleware = (req, res, next) => {
  req.startAt = new Date();
  res.on('finish', () => {
    const { success, reject } = input;
    req.endAt = new Date();
    try {
      const executionTime = req.endAt - req.startAt;
      let log = hyperwatch.util.createLog(req, res).set('executionTime', executionTime);
      if (req.body && req.body.query && req.body.variables) {
        log = log.set('graphql', { body: req.body });
      }
      if (success) {
        success(log);
      }
    } catch (err) {
      if (reject) {
        reject(err);
      }
    }
  });
  next();
};

hyperwatch.pipeline.registerInput(input);

hyperwatch.pipeline.start();

export default hyperwatch;
