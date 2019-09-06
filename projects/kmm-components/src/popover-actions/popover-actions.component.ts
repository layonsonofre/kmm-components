import { Component, Inject, Optional } from "@angular/core";

import { POPOVER_DATA } from "../popover/popover.service";
import { PopoverRef } from "../popover/popover-ref";
import { Router } from '@angular/router';

@Component({
   selector: "app-popover-actions",
   templateUrl: "./popover-actions.component.html",
   styleUrls: ["./popover-actions.component.scss"]
})
export class PopoverActionsComponent {
   constructor(
      private popoverRef: PopoverRef<string>,
      private router: Router,
      @Optional() @Inject(POPOVER_DATA) public data?: any
   ) {}

   goTo(link: any) {
      if (this.popoverRef) {
         this.popoverRef.close();
      }

      this.router.navigate([link]);
   }

   get currentRoute() {
      return this.router.url.substr(1, this.router.url.length);
   }
}
