"""App-wide config flags.

FREE MODE
---------
When ``FREE_MODE`` is enabled, VenuePlus charges nothing and **no money moves**:
no PaymentIntents, no deposits, no payouts/transfers. The full Stripe Connect
integration stays in place as a backdrop -- flip the env var off to switch
monetization back on (no code change).

Default is OFF, so existing behaviour and tests are unchanged. Activate the free
beta by setting ``FREE_MODE=true`` in the environment (e.g. Railway). Read live
from the environment so it can be toggled without a code deploy and is easy to
test.
"""
import os

_TRUE = {"1", "true", "yes", "on"}


def is_free_mode() -> bool:
    return os.getenv("FREE_MODE", "false").strip().lower() in _TRUE
