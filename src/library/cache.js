import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 15 });

export default cache;