.. skeleton documentation master file, created by
   sphinx-quickstart on Thu May 17 15:17:35 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.


.. HOME SECTION ==================================================

.. Hidden toctree to manage the sidebar navigation.

.. toctree::
  :maxdepth: 2
  :caption: Home
  :hidden:


.. README =============================================================

.. This project most likely has it's own README. We include it here.

.. toctree::
   :maxdepth: 2
   :caption: Readme

   ../../README

.. COMMUNITY SECTION ==================================================

..

.. toctree::
  :maxdepth: 2
  :caption: webjive-auth
  :hidden:

  package/guide


Welcome to the WebJive authentication documentation!
====================================================

This project provides an authentication service for use by the WebJive suite for authenticating and authorising users and identifying their shared groups

********************************************
Creating a ver basic user for authentication
********************************************

Create a .env file and mount it as a volume in the docker-compose file, containing the following entries:
.. code-block::

    LDAP_CREDENTIALS=
    LDAP_URL=
    LDAP_BIND=

Build and run:
.. code-block::

    $ docker-compose build
    $ docker-compose up





