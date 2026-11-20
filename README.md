# MedFind-V2
# MedFind V2 💊

**MedFind V2** is a digital healthcare platform designed to make finding medications easier and help pharmacies manage their daily operations efficiently.

The platform connects customers with pharmacies through two integrated applications: a **Customer App** and a **Pharmacy App**.

## Project Overview

MedFind V2 is a complete rebuild of the original MedFind project, focused on creating a functional, user-friendly experience with seamless navigation, realistic interactions, and connected workflows.

The project follows the MedFind Figma designs and aims to deliver a fully interactive demonstration without incomplete user journeys or dead-end screens.

## Applications

### 1. Customer App

The Customer App allows users to:

- Create accounts, log in, and recover passwords.
- Search for medications and discover pharmacies.
- View medication availability and pricing.
- Reserve medications for pickup or delivery.
- Make simulated online payments.
- Track and manage reservations.
- Save medications for future purchases and refills.
- View pharmacy locations on a map.
- Manage personal information, addresses, and settings.
- Receive notifications and reservation updates.

### 2. Pharmacy App

The Pharmacy App allows pharmacies to:

- Register and complete pharmacy onboarding.
- Manage pharmacy profiles and operating hours.
- Add, edit, and manage medication inventory.
- Receive, accept, and manage reservations.
- Manage delivery and pickup requests.
- Track earnings and transaction history.
- View business activity and notifications.
- Update pharmacy information and account settings.

## Key Features

### Connected Applications

Customer and pharmacy workflows are designed to work together. For example, a reservation made by a customer should appear in the corresponding pharmacy dashboard.

### New and Returning Users

New users experience appropriate empty states, while returning users can access their existing information and activity.

### Persistent Demo Data

User actions should update the interface consistently, including profile changes, saved medications, reservations, and account preferences.

### Complete User Flows

Every major feature should have a complete sequence, including loading, empty, success, confirmation, and error states where appropriate.

### Responsive Design

The applications will follow the MedFind design system, providing consistent experiences across supported screen sizes.

## Project Goals

- Build a complete, functional demonstration of MedFind.
- Maintain visual consistency with the Figma designs.
- Eliminate dead-end screens and broken navigation.
- Create realistic customer and pharmacy interactions.
- Ensure user information updates correctly throughout the apps.
- Develop a maintainable codebase that can support future improvements.

## Development Status

🚧 **Under Development**

MedFind V2 is being built as a fresh, independent project.

The initial focus is implementing the complete Customer and Pharmacy applications, connecting their demo workflows, and testing all major user journeys.

## Design Reference

The user interface and user experience are based on the MedFind Figma designs.

[View MedFind Figma Design](https://www.figma.com/design/OpCNyqo5elBMJI3z5XtxVC/MedFind--Copy-)

## Project Structure

The planned repository structure is:

```text
MedFind-V2/
├── apps/
│   ├── customer/
│   └── pharmacy/
├── packages/
│   └── shared/
├── README.md
└── package.json
```

The final structure and development commands will be documented as implementation progresses.

## Deployment

Both applications are intended to be deployed independently, with separate URLs for the Customer App and Pharmacy App.

Deployment links will be added once the new applications are available.

## Future Improvements

- Integration with live pharmacy inventory systems.
- Real payment processing.
- Real-time delivery tracking.
- Advanced pharmacy analytics.
- Push notifications.
- Enhanced medication search and recommendations.

## Disclaimer

MedFind V2 is initially intended as a demonstration platform. Simulated payments, medication availability, and reservation workflows should not be treated as real healthcare or commercial transactions.

## License

All rights reserved. License terms to be determined.
