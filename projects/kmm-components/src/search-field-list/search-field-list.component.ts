import { Component, OnInit, Inject } from "@angular/core";
import { POPOVER_DATA } from "../popover/popover.service";
import { PopoverRef } from "../popover/popover-ref";

@Component({
   selector: "lib-search-field-list",
   templateUrl: "./search-field-list.component.html",
   styleUrls: ["./search-field-list.component.scss"]
})
export class SearchFieldListComponent implements OnInit {
   constructor(
      private popoverRef: PopoverRef<any>,
      @Inject(POPOVER_DATA) public data: any
   ) {}

   ngOnInit() {}

   onSelect(item: any) {
      this.popoverRef.close(item);
   }
}
