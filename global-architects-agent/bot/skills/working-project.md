---
description: Use for uygulama / рабочий проект documentation: AR KR OV VK EO SS POS OOS SM.
---

# Working project (РП)

This is the expertise album, not a prettier sketch.

Order of work in this studio:

1. Architecture (AR) locks grids, levels, fire compartments, MGN
2. Structures (KR) on locked grids
3. MEP (OV VK EO SS) after shafts and plant rooms exist
4. POS, OOS, EE, SM last
5. BIM stays parallel; it does not replace signed sheets

Every required code in `expertise_gate` must reach `ready` or `approved`.
Record findings per set with `record_finding`.
If the user asks “are we done?”, call `expertise_gate` and stop guessing.
