# rate-limit-utils

Exposes a ThroughputLimiter (limits reqs/sec) and a ConcurrencyLimiter (does what the name says)

### Usage

```
import { limitThroughput, limitConcurrency } from 'rate-limit-utils';

// limited to 50 reqs / sec
const tputLimitedFetch = limitThroughput(fetch, 50);

// limited to 50 concurrent reqs at any time
const concLimitedFetch = limitConcurrency(fetch, 50);

// now use tputLimitedFetch or concLimitedFetch instead of fetch

```
