import { Directive, HostListener, Input } from "@angular/core";

import { PopoverRef } from "./popover-ref";

/**
 * Button that will close the current popover.
 */
@Directive({
   selector: "[popover-close]"
})
export class PopoverCloseDirective<T = any> {
   @Input("popoverClose") popoverResult: T;

   constructor(private popoverRef?: PopoverRef<T>) {}

   @HostListener("click", ["$event"]) onClick(): void {
      if (!this.popoverRef) {
         // popoverClose is not supported within a template"
         return;
      }

      this.popoverRef.close(this.popoverResult);
   }
}
