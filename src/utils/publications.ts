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

	/* Print the data into the HTML */
	public printHTML(): void {
		this.loadPublications().then((publications) => {
			this.data = publications;
			for (let i = 0; i < this.data.length; i++) {
				/* Set important variables */
				let $pubContainer = $("#publications"); // Global container

				let $publication = document.createElement("div"); // Publication container
				$publication.setAttribute("class", "publication");
				$publication.setAttribute("data-year", this.data[i].year);

				let $pubMain = document.createElement("div"); // Publication main content
				$pubMain.setAttribute("class", "pubmain");

				let $pubDetails = document.createElement("div"); // Publication details
				$pubDetails.setAttribute("class", "pubdetails");

				/* Preprocess some elements of data */
				// Preprocess title
				let $pubTitle = `<span>${this.data[i].year}</span> ${this.data[i].title}`;

				// Preprocess authors
				let authors = "";
				let author;
				for (let a = 0; a < this.data[i].author.length; a++) {
					author = this.data[i].author[a];
					if (this.data[i].author.length === 1) {
						authors += `<strong>${author}</strong>`;
						break;
					}
					if (a === this.data[i].author.length - 1) {
						authors = authors.slice(0, -2);
						if (author === "Daniel Rodriguez-Criado") {
							authors += ` and <strong>${author}</strong>`;
						} else {
							authors += " and " + author;
						}
					} else {
						if (author === "Daniel Rodriguez-Criado") {
							authors += `<strong>${author}</strong>, `;
						} else {
							authors += author + ", ";
						}
					}
				}
				// Preprocess cite
				let cite = this.data[i].in;
				let type = this.data[i].type;
				let typetxt;
				let bibTexHead;

				switch (type) {
					case "jpaper":
						typetxt = '<span class="journal">Journal Papers</span>';
						bibTexHead = "@article{";
						break;
					case "cpaper":
						typetxt = '<span class="conference">Conference Papers</span>';
						bibTexHead = "@inproceedings{";
						break;
					case "bookchapter":
						typetxt = '<span class="book">Book Chapter</span>';
						bibTexHead = "@inbook{";
						break;
					case "phdthesis":
						typetxt = '<span class="theses">Theses</span>';
						bibTexHead = "@phdthesis{";
						break;
					case "masterthesis":
						typetxt = '<span class="theses">Theses</span>';
						bibTexHead = "@masterthesis{";
						break;
					default:
						typetxt = "";
						bibTexHead = "";
				}
				cite = typetxt + cite;

				// Preprocess assests
				let iconCollapse = '<i class="fas fa-angle-double-down"></i>';
				let inconDownload = '<i class="fas fa-download"></i>';
				let inconGo = '<i class="fas fa-external-link-alt"></i>';
				let assets = `<a class="pubcollapse" href="#/"> ${iconCollapse} </a>`;

				if ("download" in this.data[i]) {
					assets =
						`<a class="pubdownload" href="${this.data[i].download}"> ${inconDownload} </a>` +
						assets;
				}

				if ("url" in this.data[i]) {
					assets = `<a class="pubgo" href="${this.data[i].url}"> ${inconGo} </a>` + assets;
				}

				// Preprocess bibtext citation
				let bibTex = `${bibTexHead}${this.data[i].key},
                              <br>`;
				for (var key in this.data[i]) {
					if (
						key === "in" ||
						key === "key" ||
						key === "abstract" ||
						key === "x" ||
						key === "abstract" ||
						key === "download" ||
						key === "url" ||
						key === "type"
					) {
						continue;
					} else {
						bibTex += `<span>${key} = "${this.data[i][key]}"</span>,
                                   <br>`;
					}
				}
				bibTex += "}";

				/* Include HTML */
				$pubMain.innerHTML = `<h4 class="pubmain__title"> ${$pubTitle} </h4>
                                     <p class="pubmain__authors"> ${authors} </p>
                                     <p class="pubmain__cite"> ${cite} </p>
                                     <div class="pubmain__assets"> ${assets} </div>`;

				$pubDetails.innerHTML = `<div class="wrapper"> <h3> BibTeX </h3>
                                        <p class="pubdetails__bibtex"> ${bibTex} </p>
                                        <h3> Abstract </h3>
                                        <p class="pubdetails__abstract">${this.data[i].abstract}</p>
                                </div>`;

				/* Incude HTML elements into the DOM */
				$publication.appendChild($pubMain);
				$publication.appendChild($pubDetails);
				$pubContainer.appendChild($publication);
			}

			this.collapseBtn();
		});
	}
}
