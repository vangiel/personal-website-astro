import { $, $$ } from "@/lib/dom-selector";
import { type Publication } from "@/types/publication";

export default class publications {
	private data: Publication[];

	constructor(data: Publication[]) {
		this.data = data;
	}

	/* Add collapse button functionality */

	private collapseBtn() {
		let $$publications = $$(".publication") as NodeListOf<HTMLDivElement>;

		$$publications.forEach(($pub: HTMLDivElement) => {
			let $btn = $(".pubcollapse", $pub);

			if ($btn) {
				$btn.addEventListener("click", function (event) {
					event.preventDefault();
					let panel = $pub.children[1] as HTMLElement;
					if (panel.style.maxHeight) {
						panel.style.maxHeight = "";
						this.innerHTML = '<i class="fas fa-angle-double-down"></i>';
					} else {
						panel.style.maxHeight = panel.scrollHeight + "px";
						this.innerHTML = '<i class="fas fa-angle-double-up"></i>';
					}
				});
			}
		});
	}
}
