# Merlin

Merlin is a library of UI [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) that support data binding. The data binding is very sophisticated and efficient, implemented using [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

In practice, that means that you get a set of new tags that  automatically reflect and update your model. For example, the following three tags:

```html
<check-box checked="this.redAndBlue">Red and Blue</check-box>
<check-box checked="this.red">Red</check-box>
<check-box checked="this.blue">Blue</check-box>
```

give you three check boxes:

 ![Checkboxes](/docs/checkboxes.png)

 These checkboxes are in turn controlled by the following model code:

 ```typescript
 class DemoModel {
    // ...

    red = true;
    blue = false;

    get redAndBlue() {
        return this.red === this.blue ? this.red : undefined;
    }

    set redAndBlue(val: boolean | undefined) {
        if (val === undefined) return;

        this.red = this.blue = val;
    }
 }
```

This implements the model for the red, blue and 'red and blue' tri-state checkbox. Note that there is no need to tell the UI when something changes - our proxy observer handles that, including the automatic update of the redAndBlue property when either red or blue fields are changed.

## Installation

Merlin is available as a public NPM package @trilogyes/merlin. To install it execute:

```bash
npm install @trilogyes/merlin
```

or if you are using yarn:

```bash
yarn add @trilogyes/merlin
```


# Virtualizacija u ItemsControl komponenti

## Trenutna implementacija

Virtualizacija u `ItemsControl` komponenti omogućava efikasno prikazivanje velikih lista podataka tako što se renderuju samo elementi koji su trenutno vidljivi u viewport-u. Ovo značajno poboljšava performanse kada radimo sa velikim kolekcijama podataka.

### Ključni elementi implementacije:

- **renderedItems**: Set koji prati indekse trenutno renderovanih elemenata
- **deletedItems**: Set koji prati indekse obrisanih elemenata
- **Sentinel elementi**: Posebni marker elementi (gornji i donji) koji služe kao granice za detekciju vidljivosti
- **IntersectionObserver**: Prati kada sentinel elementi ulaze ili izlaze iz viewport-a

## Trenutni problemi

### Problem sa brisanjem elemenata ispod donje granice

Trenutna implementacija ima sledeći tok rada:

1. Inicijalno se renderuje prvih N elemenata (trenutno 100)
2. Donja granica (bottom sentinel) postavlja se na kraju, sa indeksom N
3. Kada donja granica uđe u viewport (`isIntersecting`):
   - Renderuje se element sa indeksom koji odgovara granici
   - Granica dobija vrednost `index + 1`
   - Ovo funkcioniše kako je očekivano

4. Kada donja granica izađe iz viewport-a (`!isIntersecting`):
   - Element sa indeksom koji odgovara granici se briše
   - Granica dobija vrednost `index - 1`
   - Ovde nastaje problem kada dođemo do poslednjeg elementa za brisanje

### Detaljniji opis problema

Recimo da smo se zaustavili u nekom trenutku, i poslednji element za brisanje ima indeks 11. Kada se taj element obriše, indeks donje granice će se smanjiti na 10 (umesto da ostane na 11). 

Kada kasnije pokušamo da ponovo renderujemo element sa indeksom 10, provera u funkciji `#renderItemAtIndex` (`if (this.#renderedItems.has(index)) return;`) će sprečiti renderovanje jer je element sa indeksom 10 već u setu `renderedItems`.

## Trenutno rešenje

Implementirano je privremeno rešenje korišćenjem zastavice `itemWasRecentlyDeleted`:

1. Kada se element obriše, postavlja se `itemWasRecentlyDeleted = true`
2. Kada donja granica ponovo uđe u viewport, proverava se ova zastavica
3. Ako je zastavica postavljena, indeks granice se povećava za 1 pre renderovanja
4. Zastavica se resetuje nakon korišćenja

Ovo rešenje funkcioniše, ali nije idealno. Da li je ovo rešenje fleksibilno za dalje korišćenje, kao i ceo sistem kojim sam odlučio da rešim ovaj problem?

