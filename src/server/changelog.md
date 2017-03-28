# server

## 0.1.3

* Refactor:
    * Rename Endpoint to Route
    * Rename Page to Document
    * Update subclasses

## 0.1.1

* Feature: Segregated server from GUI application handling

## 0.1.0

* Feature: Database-managed dynamic routing
    * Added support for ArangoDB
* Refactor: change server integration to MVC model

### Object Hierarchy

* ModelObject (inherits from Base)
    * Added: Context - configurable routing hubs
        * Added: Host - router-routing based on hostname
    * Added: Endpoint
        * Added: StaticRoute - configurable static routing
    * Preparation classes for future features

## 0.2.0

* Added Router superclass
* Added HostRouter subclass
