import { eslintCompatPlugin } from "@oxlint/plugins";

import { globalDataRule } from "./rules/global-data.ts";
import { mutableDataRule } from "./rules/mutable-data.ts";
import { mysteriousNameRule } from "./rules/mysterious-name.ts";

/** Selected design prompts; findings warrant review rather than automatic refactoring. */
export default eslintCompatPlugin({
	meta: { name: "anti-slop-martinfowler" },
	rules: {
		"global-data": globalDataRule,
		"mutable-data": mutableDataRule,
		"mysterious-name": mysteriousNameRule,
	},
});
